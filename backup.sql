--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

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
-- Name: admin_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    replit_id text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_users OWNER TO neondb_owner;

--
-- Name: attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attempts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    paper_id character varying NOT NULL,
    session_id text NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    total_score integer,
    max_score integer
);


ALTER TABLE public.attempts OWNER TO neondb_owner;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.boards (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public.boards OWNER TO neondb_owner;

--
-- Name: levels; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.levels (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.levels OWNER TO neondb_owner;

--
-- Name: paper_pages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.paper_pages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    paper_id character varying NOT NULL,
    page_number integer NOT NULL,
    image_path text NOT NULL,
    text_ocr text,
    max_marks integer DEFAULT 6
);


ALTER TABLE public.paper_pages OWNER TO neondb_owner;

--
-- Name: papers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.papers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    subject_id character varying NOT NULL,
    board_id character varying NOT NULL,
    level_id character varying NOT NULL,
    series text,
    year integer NOT NULL,
    paper_code text,
    tier text,
    title text NOT NULL,
    question_count integer,
    total_marks integer,
    pdf_path text,
    mark_scheme_path text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.papers OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    paper_id character varying NOT NULL,
    question_number text NOT NULL,
    page_number integer NOT NULL,
    max_marks integer NOT NULL,
    instructions text,
    mark_scheme_excerpt text
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: responses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.responses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    attempt_id character varying NOT NULL,
    question_id character varying,
    page_number integer NOT NULL,
    student_answer text NOT NULL,
    ai_score integer,
    ai_feedback text,
    ai_confidence text,
    improvement_tips jsonb,
    max_marks integer NOT NULL,
    reviewed_by_human boolean DEFAULT false,
    final_score integer,
    final_feedback text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.responses OWNER TO neondb_owner;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subjects (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    level_id character varying NOT NULL
);


ALTER TABLE public.subjects OWNER TO neondb_owner;

--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_users (id, email, replit_id, created_at) FROM stdin;
\.


--
-- Data for Name: attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attempts (id, paper_id, session_id, started_at, completed_at, total_score, max_score) FROM stdin;
46136de3-e86c-406c-bf85-4981f9de8853	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762899074277-zt0r908hl	2025-11-11 22:11:14.501157	\N	\N	\N
ca304755-199b-4dba-b591-513b60170084	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762899449427-dqwgsacq7	2025-11-11 22:17:29.6372	\N	\N	\N
d53d0e66-a215-430d-830e-fead2c85938a	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762899594200-abcz7sjji	2025-11-11 22:19:54.25138	\N	\N	\N
50809082-a34e-4c62-a092-bdcedd14bd27	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762899841745-zjt1esjml	2025-11-11 22:24:01.808337	\N	\N	\N
80ab8632-c79e-48be-a02d-6239fa916171	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762900026404-w9r7xvc28	2025-11-11 22:27:06.474477	\N	\N	\N
5d38e579-0550-43af-950a-ebe85c61e18f	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762900163145-qxb5k7l3t	2025-11-11 22:29:23.199991	\N	\N	\N
85845dc3-0c79-42cc-b44e-8779bdbc3cb9	aqa-psychology-alevel-7182-1-2024-june-qp	anon-1762900545781-49yrgszl7	2025-11-11 22:35:45.748988	\N	\N	\N
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.boards (id, name, slug) FROM stdin;
a2def229-8379-478a-970a-671d93d222ca	AQA	aqa
dd2d4551-0901-452a-a2f2-0734e7a77ad4	Edexcel	edexcel
ebe89f96-d2b8-45c4-a99b-e56841495ee8	OCR	ocr
6b07b25c-33d3-4f2d-835f-76a3a91f968b	WJEC	wjec
40b81b5e-632e-40a4-842e-c6189146e1c2	CCEA	ccea
\.


--
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.levels (id, name) FROM stdin;
bf60e979-89dc-4c5f-b1a6-3e878b557751	GCSE
9762cc22-c82c-4d72-851b-1e91fb342f14	A-Level
\.


--
-- Data for Name: paper_pages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.paper_pages (id, paper_id, page_number, image_path, text_ocr, max_marks) FROM stdin;
c3b74f00-a2df-4a7d-b065-b708fc0acb9a	aqa-psychology-alevel-7182-1-2024-june-qp	1	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-1.png	\N	6
389736b7-c985-4445-9c98-d2b19649392f	aqa-psychology-alevel-7182-1-2024-june-qp	2	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-2.png	\N	6
c45b6e7a-2341-48af-92a9-bedf2863529e	aqa-psychology-alevel-7182-1-2024-june-qp	3	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-3.png	\N	6
734b648d-d808-4f84-8676-ba16e9fa2d97	aqa-psychology-alevel-7182-1-2024-june-qp	4	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-4.png	\N	6
351e40da-c2af-4308-87ed-d3a60487fc96	aqa-psychology-alevel-7182-1-2024-june-qp	5	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-5.png	\N	6
4e0797e5-080a-4b8a-b503-f772ab451743	aqa-psychology-alevel-7182-1-2024-june-qp	6	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-6.png	\N	6
fd59defa-a643-41df-8caa-67d984fbf668	aqa-psychology-alevel-7182-1-2024-june-qp	7	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-7.png	\N	6
e84d6303-68fe-45b8-a91c-dbec4cb32053	aqa-psychology-alevel-7182-1-2024-june-qp	8	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-8.png	\N	6
3d1f9887-12bc-431a-bdb8-50702452f2a2	aqa-psychology-alevel-7182-1-2024-june-qp	9	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-9.png	\N	6
f96b5984-3cda-4f1a-ae73-2472871e3204	aqa-psychology-alevel-7182-1-2024-june-qp	10	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-10.png	\N	6
c84b18b8-5fea-4984-a04b-4b71c2ec9416	aqa-psychology-alevel-7182-1-2024-june-qp	11	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-11.png	\N	6
cac6e198-569c-43d5-ba45-bfae8de183fa	aqa-psychology-alevel-7182-1-2024-june-qp	12	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-12.png	\N	6
f13c93d1-56f9-4f8f-9765-33b395fe94eb	aqa-psychology-alevel-7182-1-2024-june-qp	13	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-13.png	\N	6
0ee8f2f8-ade9-4fc1-9d10-662c16199645	aqa-psychology-alevel-7182-1-2024-june-qp	14	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-14.png	\N	6
ef1a2b63-6d71-4f03-aa40-5b32d06a916d	aqa-psychology-alevel-7182-1-2024-june-qp	15	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-15.png	\N	6
20bb2a43-b0bd-4111-97b9-c6421bc7940b	aqa-psychology-alevel-7182-1-2024-june-qp	16	/uploads/page-images/aqa-psychology-alevel-7182-1-2024-june-qp/page-16.png	\N	6
\.


--
-- Data for Name: papers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.papers (id, subject_id, board_id, level_id, series, year, paper_code, tier, title, question_count, total_marks, pdf_path, mark_scheme_path, status, created_at) FROM stdin;
aqa-psychology-alevel-7182-1-2024-june-qp	1726a09f-e860-4c5a-b1dd-a2b1f8de50a4	a2def229-8379-478a-970a-671d93d222ca	9762cc22-c82c-4d72-851b-1e91fb342f14	June 2024	2024	7182/1	\N	A-level Psychology Paper 1: Introductory topics in psychology (Question Paper)	16	96	/uploads/papers/aqa-psychology-alevel-7182-1-2024-june-qp.pdf	https://pmt.physicsandmathstutor.com/download/Psychology/A-level/Past-Papers/AQA/Paper-1/June%202024%20MS%20-%20Paper%201%20AQA%20Psychology%20A-level.pdf	active	2025-11-11 00:00:00
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, paper_id, question_number, page_number, max_marks, instructions, mark_scheme_excerpt) FROM stdin;
\.


--
-- Data for Name: responses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.responses (id, attempt_id, question_id, page_number, student_answer, ai_score, ai_feedback, ai_confidence, improvement_tips, max_marks, reviewed_by_human, final_score, final_feedback, created_at) FROM stdin;
e67d3fb0-1ced-4091-830a-7f467353b1fd	46136de3-e86c-406c-bf85-4981f9de8853	\N	1	This is my answer for page 1. Memory is the ability to encode, store, and retrieve information. The multi-store model proposes three stores: sensory, short-term, and long-term memory.	3	The student provides a basic definition of memory and mentions the multi-store model with its three components. However, the answer lacks depth and detail about each store and how they interact. More explanation and examples would strengthen the response.	medium	["Expand on each component of the multi-store model by explaining the characteristics and functions of sensory, short-term, and long-term memory.", "Include examples or research studies that support the multi-store model to demonstrate understanding.", "Discuss the processes of encoding, storage, and retrieval in more detail to show a comprehensive understanding of memory."]	6	f	\N	\N	2025-11-11 22:11:56.867136
008ff314-458d-433a-8109-fda4707bee08	46136de3-e86c-406c-bf85-4981f9de8853	\N	2	Page 2 answer about cognitive psychology and research methods in the field.	0	The response does not address the question as it lacks content related to cognitive psychology and research methods. There is no explanation or analysis provided, which is essential for earning marks.	high	["Ensure to read the question carefully and provide a relevant answer that addresses all aspects of the prompt.", "Include specific examples or theories from cognitive psychology to demonstrate your understanding of the topic.", "Structure your response clearly, using paragraphs to separate different points or arguments."]	6	f	\N	\N	2025-11-11 22:12:43.997883
cc8529f6-78d9-46e0-8eb2-398515f7f0b0	46136de3-e86c-406c-bf85-4981f9de8853	\N	3	Page 3 answer discussing attachment theory and Bowlby's monotropic theory.	0	The answer does not provide any relevant content related to attachment theory or Bowlby's monotropic theory. There is no discussion or explanation of key concepts, which is essential for earning marks in this question.	high	["Ensure that you directly address the question by discussing key concepts of attachment theory and Bowlby's monotropic theory.", "Include definitions and explanations of important terms, such as 'monotropy' and 'internal working model', to demonstrate your understanding.", "Provide examples or applications of the theory to illustrate your points and strengthen your argument."]	6	f	\N	\N	2025-11-11 22:13:26.209071
adc0f18b-8566-47e0-b8bc-e4936bfbe95f	ca304755-199b-4dba-b591-513b60170084	\N	1	Memory stores information	1	The answer is very vague and lacks detail. While it correctly states that memory stores information, it does not explain how memory works, the types of memory, or any relevant processes involved in memory storage. More elaboration is needed to demonstrate understanding.	high	["Expand on the types of memory (e.g., short-term, long-term) and their functions.", "Include examples of how information is encoded, stored, and retrieved.", "Discuss the processes involved in memory, such as attention and rehearsal."]	6	f	\N	\N	2025-11-11 22:18:05.794434
492860ea-ddf0-4984-9ca6-64ebc3c9ee0e	d53d0e66-a215-430d-830e-fead2c85938a	\N	1	Memory stores information	1	The response is overly simplistic and lacks detail. While it correctly identifies that memory stores information, it does not explain how memory works, the types of memory, or the processes involved in memory storage. More elaboration is needed to demonstrate a deeper understanding of the topic.	high	["Expand on the different types of memory (e.g., short-term, long-term) and their functions.", "Include explanations of how information is encoded, stored, and retrieved in memory.", "Provide examples or applications of memory in real-life situations to enhance your answer."]	6	f	\N	\N	2025-11-11 22:22:35.779512
4f2224eb-d0d0-4f53-86c0-195a06f64aa7	50809082-a34e-4c62-a092-bdcedd14bd27	\N	1	Test answer for debugging	0	The response does not address the question at all and is simply a placeholder text. There is no evidence of understanding or application of relevant concepts.	high	["Ensure you read the question carefully and understand what is being asked.", "Provide a structured answer that includes relevant information and clear explanations.", "Practice answering similar questions to improve your ability to formulate complete responses."]	6	f	\N	\N	2025-11-11 22:24:28.522972
bda129aa-305c-41d1-8a55-17486e8d9650	80ab8632-c79e-48be-a02d-6239fa916171	\N	1	Simple test	0	The response 'Simple test' does not address the question or provide any relevant information. There is no explanation, methodology, or answer presented, which is necessary to earn marks.	high	["Read the question carefully and ensure you understand what is being asked.", "Provide a detailed answer that includes relevant information, explanations, or calculations.", "Practice structuring your answers clearly to convey your understanding effectively."]	6	f	\N	\N	2025-11-11 22:27:32.991947
db455cc5-2052-4b3f-95fc-e9bef5588ace	5d38e579-0550-43af-950a-ebe85c61e18f	\N	1	Memory involves encoding, storage and retrieval processes	2	The student correctly identifies the three key processes of memory: encoding, storage, and retrieval. However, the answer lacks depth and explanation of each process. To achieve a higher mark, the student should elaborate on what each process entails and how they interact in the context of memory.	medium	["Expand on each of the three processes of memory: provide definitions and examples for encoding, storage, and retrieval.", "Discuss the importance of these processes in the overall functioning of memory.", "Consider including relevant theories or models of memory to support your answer."]	6	f	\N	\N	2025-11-11 22:29:46.968478
2750b8cd-48e5-43f4-9ccf-7a7261ca4710	5d38e579-0550-43af-950a-ebe85c61e18f	\N	2	Research methods in psychology	1	The response only states 'Research methods in psychology' without providing any explanation or detail. To earn more marks, the student should outline specific research methods, their strengths and weaknesses, and how they are used in psychological research.	high	["Provide a brief description of at least three different research methods used in psychology, such as experiments, surveys, and observational studies.", "Discuss the advantages and disadvantages of each method to demonstrate a deeper understanding.", "Use examples to illustrate how these methods are applied in real psychological research."]	6	f	\N	\N	2025-11-11 22:30:36.960352
a5d127bc-793d-42c7-b65f-5a0f3eebd3ee	5d38e579-0550-43af-950a-ebe85c61e18f	\N	4	Attachment theory test answer	1	The response is too vague and lacks specific details about attachment theory. While it mentions 'attachment theory', it does not explain key concepts, types of attachment, or the significance of the theory. More elaboration is needed to demonstrate understanding.	high	["Provide a clear definition of attachment theory and its origin.", "Discuss the different types of attachment (secure, avoidant, ambivalent) and their implications.", "Include examples or studies that support the theory to strengthen your answer."]	6	f	\N	\N	2025-11-11 22:31:09.159465
7fc94d74-41c5-49a5-84f8-726122cf2a30	5d38e579-0550-43af-950a-ebe85c61e18f	\N	5	Cognitive development theory answer	1	The response is very vague and lacks specific details about cognitive development theory. While it mentions the theory, it does not explain key concepts, stages, or relevant theorists such as Piaget or Vygotsky. This limits the effectiveness of the answer.	high	["Provide a clear definition of cognitive development theory and its importance.", "Include key theorists and their contributions, such as Piaget's stages of cognitive development.", "Use examples to illustrate how cognitive development occurs at different stages."]	6	f	\N	\N	2025-11-11 22:34:57.254321
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subjects (id, name, level_id) FROM stdin;
993ba6aa-4ceb-4fe6-898a-d41a84382fa2	Mathematics	bf60e979-89dc-4c5f-b1a6-3e878b557751
c8209d82-059b-49b3-a5aa-bbaa5979f1fc	English Language	bf60e979-89dc-4c5f-b1a6-3e878b557751
fb2f8d18-2503-44e9-bc28-8e2c6b651a60	English Literature	bf60e979-89dc-4c5f-b1a6-3e878b557751
71574760-9f7f-481c-8c10-a8dc0de988b2	Biology	bf60e979-89dc-4c5f-b1a6-3e878b557751
306b648e-0c34-449a-9445-c64ad987b091	Chemistry	bf60e979-89dc-4c5f-b1a6-3e878b557751
aff57b36-526e-42f5-9aad-e8674082ccbc	Physics	bf60e979-89dc-4c5f-b1a6-3e878b557751
5bd85013-5604-4477-938b-c654e8b5b0eb	Combined Science	bf60e979-89dc-4c5f-b1a6-3e878b557751
3352646a-1cb4-4e73-bd0d-744a88729b79	Mathematics	9762cc22-c82c-4d72-851b-1e91fb342f14
b3bbd81d-7916-4bc8-8b95-4cac6dfe5b12	Biology	9762cc22-c82c-4d72-851b-1e91fb342f14
2c28f9ad-ebbe-4a1a-a9e2-86726d5f199d	Chemistry	9762cc22-c82c-4d72-851b-1e91fb342f14
7e704685-41c9-4529-bf8b-741d94d4de26	Physics	9762cc22-c82c-4d72-851b-1e91fb342f14
3fe3de92-4f1b-4727-944d-feca38606453	English Language	9762cc22-c82c-4d72-851b-1e91fb342f14
410554c7-2e61-4536-84cc-49ce1caf7e33	English Literature	9762cc22-c82c-4d72-851b-1e91fb342f14
1726a09f-e860-4c5a-b1dd-a2b1f8de50a4	Psychology	9762cc22-c82c-4d72-851b-1e91fb342f14
a11cfc75-e48d-4027-bea0-74500fec6ebe	Business	9762cc22-c82c-4d72-851b-1e91fb342f14
\.


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_replit_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_replit_id_unique UNIQUE (replit_id);


--
-- Name: attempts attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: boards boards_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_slug_unique UNIQUE (slug);


--
-- Name: levels levels_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_name_unique UNIQUE (name);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: paper_pages paper_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.paper_pages
    ADD CONSTRAINT paper_pages_pkey PRIMARY KEY (id);


--
-- Name: papers papers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: responses responses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: attempts attempts_paper_id_papers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attempts
    ADD CONSTRAINT attempts_paper_id_papers_id_fk FOREIGN KEY (paper_id) REFERENCES public.papers(id);


--
-- Name: paper_pages paper_pages_paper_id_papers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.paper_pages
    ADD CONSTRAINT paper_pages_paper_id_papers_id_fk FOREIGN KEY (paper_id) REFERENCES public.papers(id);


--
-- Name: papers papers_board_id_boards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_board_id_boards_id_fk FOREIGN KEY (board_id) REFERENCES public.boards(id);


--
-- Name: papers papers_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: papers papers_subject_id_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.papers
    ADD CONSTRAINT papers_subject_id_subjects_id_fk FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: questions questions_paper_id_papers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_paper_id_papers_id_fk FOREIGN KEY (paper_id) REFERENCES public.papers(id);


--
-- Name: responses responses_attempt_id_attempts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_attempt_id_attempts_id_fk FOREIGN KEY (attempt_id) REFERENCES public.attempts(id);


--
-- Name: responses responses_question_id_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.responses
    ADD CONSTRAINT responses_question_id_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: subjects subjects_level_id_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_level_id_levels_id_fk FOREIGN KEY (level_id) REFERENCES public.levels(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

