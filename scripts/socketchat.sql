--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: socketchat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.socketchat (
    roomname character varying(30),
    users jsonb,
    messages jsonb
);


ALTER TABLE public.socketchat OWNER TO postgres;

--
-- Data for Name: socketchat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.socketchat (roomname, users, messages) FROM stdin;
math	{}	{}
literature	{}	{}
history	{}	{}
science	{}	{}
general	{}	{}
\.


--
-- PostgreSQL database dump complete
--