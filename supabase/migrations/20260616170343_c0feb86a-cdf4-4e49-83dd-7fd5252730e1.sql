
-- Seed test users with admin/client roles
DO $$
DECLARE
  v_henrique uuid;
  v_guilherme uuid;
  v_cliente uuid;
BEGIN
  -- Henrique (admin)
  SELECT id INTO v_henrique FROM auth.users WHERE email = 'henrique@neias.com.br';
  IF v_henrique IS NULL THEN
    v_henrique := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_henrique, 'authenticated', 'authenticated',
      'henrique@neias.com.br', crypt('Kau@2022', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Henrique"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_henrique, jsonb_build_object('sub', v_henrique::text, 'email', 'henrique@neias.com.br'), 'email', v_henrique::text, now(), now(), now());
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_henrique, 'admin') ON CONFLICT DO NOTHING;

  -- Guilherme (admin secundário)
  SELECT id INTO v_guilherme FROM auth.users WHERE email = 'guilherme@teste.com.br';
  IF v_guilherme IS NULL THEN
    v_guilherme := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_guilherme, 'authenticated', 'authenticated',
      'guilherme@teste.com.br', crypt('teste123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Guilherme"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_guilherme, jsonb_build_object('sub', v_guilherme::text, 'email', 'guilherme@teste.com.br'), 'email', v_guilherme::text, now(), now(), now());
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_guilherme, 'admin') ON CONFLICT DO NOTHING;

  -- Cliente teste
  SELECT id INTO v_cliente FROM auth.users WHERE email = 'teste@teste.com';
  IF v_cliente IS NULL THEN
    v_cliente := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_cliente, 'authenticated', 'authenticated',
      'teste@teste.com', crypt('teste123', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Cliente Teste"}'::jsonb,
      false, '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_cliente, jsonb_build_object('sub', v_cliente::text, 'email', 'teste@teste.com'), 'email', v_cliente::text, now(), now(), now());
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_cliente, 'user') ON CONFLICT DO NOTHING;
END $$;
