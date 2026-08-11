-- 백업 버킷.
--
-- ⚠ public = false. 서명 URL로만 닿는다.
-- ⚠ deny-all RLS를 켠다. 서비스 롤이 우회하므로 격리를 **보장하지는 않지만**,
--    실수로 anon 키가 새어나갔을 때 사고 등급이 한 단계 낮아진다.
insert into storage.buckets (id, name, public, file_size_limit)
values ('backups', 'backups', false, 20971520)
on conflict (id) do nothing;

-- anon·authenticated에게는 아무 정책도 주지 않는다 = 전부 거부.
-- (정책이 하나도 없는 것이 곧 deny-all이다. 명시적으로 남겨둔다.)
