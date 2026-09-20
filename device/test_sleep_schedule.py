"""Mirror of sleepSeconds() in the sketch, with the boundaries asserted.

Kept in lockstep by hand: if the C changes, change this and re-run.
"""
QUIET_START_H, QUIET_END_H = 22, 5


def sleep_seconds(h, m, s, start=QUIET_START_H, end=QUIET_END_H):
    secs = 3600 - (m * 60 + s)
    hour = (h + 1) % 24
    i = 0
    while i < 24 and (hour >= start or hour < end):
        secs += 3600
        hour = (hour + 1) % 24
        i += 1
    return secs


def lands(h, m, s):
    """Wall-clock hour the panel wakes at, for readability in failures."""
    return ((h * 3600 + m * 60 + s) + sleep_seconds(h, m, s)) // 3600 % 24


cases = [
    # (h, m, s, expected seconds, expected landing hour)
    (10, 15, 30, 2670, 11),      # ordinary daytime run
    (20, 59, 0, 60, 21),         # last refresh of the evening
    (21, 0, 0, 3600 * 8, 5),     # the evening's last refresh -> straight to 05:00
    (21, 5, 0, 28500, 5),        # into the quiet block -> 05:00
    (23, 30, 0, 19800, 5),
    (4, 30, 0, 1800, 5),         # last quiet hour -> the 05:00 refresh
    (4, 59, 59, 1, 5),
    (0, 0, 0, 18000, 5),         # midnight wake (only after an EN press)
    (5, 0, 0, 3600, 6),          # morning, normal hourly cadence resumes
]

for h, m, s, want, want_hour in cases:
    got = sleep_seconds(h, m, s)
    assert got == want, f"{h:02d}:{m:02d}:{s:02d} -> {got}s, expected {want}s"
    assert lands(h, m, s) == want_hour, f"{h:02d}:{m:02d}:{s:02d} lands at {lands(h,m,s)}, expected {want_hour}"
    print(f"{h:02d}:{m:02d}:{s:02d} -> {got:6d}s  wakes {want_hour:02d}:00")

# the cap: a mistaken pair of constants must not hang the boot
stuck = sleep_seconds(12, 0, 0, start=5, end=5)
assert stuck == 3600 + 24 * 3600, stuck
print("loop cap holds when QUIET_START_H == QUIET_END_H ->", stuck, "s")

# every hour of the day terminates and never lands inside the quiet block
for h in range(24):
    assert not (QUIET_START_H <= lands(h, 0, 0) or lands(h, 0, 0) < QUIET_END_H), h
print("no hour of the day lands inside the quiet block")
print("all sleep-schedule assertions passed")
