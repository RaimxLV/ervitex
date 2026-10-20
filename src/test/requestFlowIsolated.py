#!/usr/bin/env python3
"""Isolated regression test; Python 3 + psql; no project writes or network APIs."""
import concurrent.futures as cf
import json
import subprocess
import threading
import uuid

PSQL = ['psql', '-X', '-q', '-A', '-t', '-h', '/tmp/requests-audit/socket',
        '-p', '55432', '-U', 'nobody', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1']
RUN = 'audit-' + uuid.uuid4().hex
IDS = []
ROTATION = ['ilona', 'justine', 'santa', 'laura']

def sql(text, fail=False):
    p = subprocess.run(PSQL, input=text, text=True, capture_output=True, timeout=40)
    if fail:
        assert p.returncode != 0 and 'Nav atļauts' in p.stderr, 'Wrong key not denied'
        return
    if p.returncode:
        raise RuntimeError('Isolated SQL failed (details suppressed to avoid row disclosure)')
    return p.stdout.strip()

def lit(x):
    return "'" + str(x).replace("'", "''") + "'"

def data(q):
    return json.loads(sql('SELECT coalesce(jsonb_agg(to_jsonb(t)),\'[]\'::jsonb) FROM (' + q + ') t;'))

def snapshot():
    return data('SELECT * FROM public.quote_requests ORDER BY id')

def position():
    return int(sql('SELECT next_position FROM public.quote_assignment_rotation WHERE id=1;'))

def identity():
    i, k = str(uuid.uuid4()), str(uuid.uuid4())
    IDS.append(i)
    return i, k

def email(tag):
    return RUN + '-' + tag + '@example.invalid'

def submit(i, k, e, fail=False):
    payload = {'name': 'Synthetic audit', 'email': e, 'items': [],
               'assigned_pm_slug': 'forged', 'assigned_pm_name': 'Forged',
               'assigned_pm_email': 'forged@example.invalid'}
    statement = ('SET ROLE anon; SELECT public.submit_quote_request('
                 + lit(i) + '::uuid,' + lit(k) + '::uuid,'
                 + lit(json.dumps(payload)) + '::jsonb);')
    result = sql(statement, fail)
    if not fail:
        assert result == 't', 'Submission did not return true'

def row(i):
    return data('SELECT * FROM public.quote_requests WHERE id=' + lit(i) + '::uuid')[0]

def batch(tasks):
    gate = threading.Barrier(len(tasks))
    def worker(t):
        gate.wait(timeout=15)
        submit(*t)
    with cf.ThreadPoolExecutor(max_workers=len(tasks)) as pool:
        list(pool.map(worker, tasks))

def owner(r):
    return tuple(r[c] for c in ('assigned_pm_slug', 'assigned_pm_name', 'assigned_pm_email'))

def main():
    before = snapshot()
    initial = position()
    assert len(before) == 6 and initial == 1, 'Expected six history rows and position 1'
    assert int(sql("SELECT count(*) FROM pg_trigger WHERE tgrelid='public.quote_requests'::regclass AND NOT tgisinternal AND tgenabled='O' AND tgfoid='public.assign_quote_request_manager()'::regprocedure;")) == 1
    counters = {}
    try:
        seeds = []
        for n, expected in enumerate(ROTATION):
            i, k = identity()
            e = email('seed-' + str(n))
            submit(i, k, e)
            assert row(i)['assigned_pm_slug'] == expected
            seeds.append((i, k, e))
        assert position() == initial
        counters['sequential_strict_rotation'] = '4/4 (Ilona, Justine, Santa, Laura)'

        tasks, new_ids = [], []
        for n in range(12):
            i, k = identity()
            new_ids.append(i)
            tasks.append((i, k, email('new-' + str(n))))
            i, k = identity()
            tasks.append((i, k, '  ' + seeds[0][2].upper() + '  '))
        batch(tasks)
        inserted = [row(i) for i in new_ids]
        inserted.sort(key=lambda r: r['assigned_at'])
        assert len({r['assigned_at'] for r in inserted}) == 12
        assert [r['assigned_pm_slug'] for r in inserted] == ROTATION * 3
        returning_ids = [t[0] for t in tasks if t[0] not in new_ids]
        assert all(owner(row(i)) == owner(row(seeds[0][0])) and
                   row(i)['email'] == seeds[0][2] for i in returning_ids)
        assert position() == initial
        counters['concurrent_mixed'] = '24/24 (12 new strict rotation, 12 normalized returning)'

        i, k = identity()
        p = position()
        batch([(i, k, email('retry'))] * 16)
        saved = row(i)
        assert saved['assigned_pm_slug'] == ROTATION[0]
        assert position() == (p + 1) % 4
        submit(i, k, email('retry-changed-payload'))
        assert row(i) == saved
        submit(i, str(uuid.uuid4()), email('retry'), fail=True)
        assert row(i) == saved and position() == (p + 1) % 4
        counters['same_id_same_key'] = '17/17 true, exactly 1 row and 1 advance'
        counters['wrong_key'] = '1/1 denied; row and rotation unchanged'

        p = position()
        same = []
        for n in range(12):
            i, k = identity()
            same.append((i, k, ('  ' + email('same-email').upper() + '  ') if n % 2 else email('same-email')))
        batch(same)
        same_rows = [row(t[0]) for t in same]
        assert len({owner(r) for r in same_rows}) == 1
        assert all(r['email'] == email('same-email') for r in same_rows)
        assert same_rows[0]['assigned_pm_slug'] == ['laura','ilona','justine','santa'][p]
        assert position() == (p + 1) % 4
        counters['concurrent_same_normalized_email'] = '12/12 sticky; exactly 1 advance'

        p = position()
        for n, slug in enumerate(['santa', 'external-specialist']):
            seed = seeds[n]
            sql('UPDATE public.quote_requests SET assigned_pm_slug=' + lit(slug)
                + ',assigned_pm_name=\'Synthetic manual\',assigned_pm_email=\'manual@example.invalid\',assigned_at=clock_timestamp() WHERE id='
                + lit(seed[0]) + '::uuid;')
            i, k = identity()
            submit(i, k, ' ' + seed[2].upper() + ' ')
            assert owner(row(i)) == owner(row(seed[0]))
        assert position() == p
        counters['manual_ownership'] = '2/2 preserved (rotation and nonrotation); 0 advances'

        i, k = identity()
        sql('INSERT INTO public.quote_requests(id,name,email,assigned_pm_slug,assigned_pm_name,assigned_pm_email) VALUES ('
            + lit(i) + '::uuid,\'Synthetic direct insert\',' + lit(email('direct'))
            + ',\'forged\',\'Forged\',\'forged@example.invalid\');')
        assert row(i)['assigned_pm_slug'] == ['laura','ilona','justine','santa'][p]
        assert all(row(i)['assigned_pm_slug'] != 'forged' for i in IDS)
        counters['forged_owner'] = '44/44 ignored (43 RPC rows + 1 direct-trigger row)'
        current = snapshot()
        original_ids = {r['id'] for r in before}
        assert [r for r in current if r['id'] in original_ids] == before
        assert len(current) == 50 and position() == 0
        counters['history'] = '6/6 byte-equivalent JSON row snapshots unchanged'
        counters['before_cleanup'] = '50 rows = 6 history + 44 synthetic; rotation 0'
    finally:
        # IDs are generated only by this run; no deletion based on customer fields.
        if IDS:
            sql('BEGIN; DELETE FROM public.quote_requests WHERE id IN ('
                + ','.join(lit(i) + '::uuid' for i in IDS)
                + '); UPDATE public.quote_assignment_rotation SET next_position='
                + str(initial) + ' WHERE id=1; COMMIT;')
        assert snapshot() == before and position() == initial, 'Cleanup mismatch'
    counters['cleanup'] = 'PASS: 6 original rows unchanged, rotation restored to 1'
    print(json.dumps({'status': 'PASS', 'checks': counters}, indent=2))

if __name__ == '__main__':
    main()
