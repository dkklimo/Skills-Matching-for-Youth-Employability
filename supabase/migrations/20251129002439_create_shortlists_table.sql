create table
  public.shortlists (
    id uuid not null default gen_random_uuid (),
    created_at timestamp with time zone not null default now(),
    employer_id uuid not null,
    candidate_id uuid not null,
    constraint shortlists_pkey primary key (id),
    constraint unique_shortlist_pair unique (employer_id, candidate_id)
  );

alter table
  public.shortlists enable row security;

create policy "Employers can view their own shortlists." on public.shortlists for select to authenticated using (employer_id = auth.uid());

create policy "Employers can insert into their own shortlists." on public.shortlists for insert to authenticated with check (employer_id = auth.uid());

create policy "Employers can delete from their own shortlists." on public.shortlists for delete to authenticated using (employer_id = auth.uid());

alter table
  public.shortlists add constraint "shortlists_candidate_id_fkey" foreign key (candidate_id) references profiles (id) on delete cascade;

alter table
  public.shortlists add constraint "shortlists_employer_id_fkey" foreign key (employer_id) references profiles (id) on delete cascade;
