--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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

--
-- Name: grocery_market; Type: SCHEMA; Schema: -; Owner: divs
--

CREATE SCHEMA grocery_market;


ALTER SCHEMA grocery_market OWNER TO divs;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_item; Type: TABLE; Schema: grocery_market; Owner: divs
--

CREATE TABLE grocery_market.order_item (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE grocery_market.order_item OWNER TO divs;

--
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: grocery_market; Owner: divs
--

CREATE SEQUENCE grocery_market.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE grocery_market.order_item_id_seq OWNER TO divs;

--
-- Name: order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: grocery_market; Owner: divs
--

ALTER SEQUENCE grocery_market.order_item_id_seq OWNED BY grocery_market.order_item.id;


--
-- Name: orders; Type: TABLE; Schema: grocery_market; Owner: divs
--

CREATE TABLE grocery_market.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(20),
    total_amount double precision NOT NULL,
    created_at timestamp without time zone,
    delivery_address character varying(200) NOT NULL
);


ALTER TABLE grocery_market.orders OWNER TO divs;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: grocery_market; Owner: divs
--

CREATE SEQUENCE grocery_market.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE grocery_market.orders_id_seq OWNER TO divs;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: grocery_market; Owner: divs
--

ALTER SEQUENCE grocery_market.orders_id_seq OWNED BY grocery_market.orders.id;


--
-- Name: payment; Type: TABLE; Schema: grocery_market; Owner: divs
--

CREATE TABLE grocery_market.payment (
    id integer NOT NULL,
    order_id integer NOT NULL,
    amount double precision NOT NULL,
    status character varying(20),
    payment_method character varying(50),
    transaction_id character varying(100),
    created_at timestamp without time zone,
    user_id integer
);


ALTER TABLE grocery_market.payment OWNER TO divs;

--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: grocery_market; Owner: divs
--

CREATE SEQUENCE grocery_market.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE grocery_market.payment_id_seq OWNER TO divs;

--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: grocery_market; Owner: divs
--

ALTER SEQUENCE grocery_market.payment_id_seq OWNED BY grocery_market.payment.id;


--
-- Name: product; Type: TABLE; Schema: grocery_market; Owner: divs
--

CREATE TABLE grocery_market.product (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price double precision NOT NULL,
    stock integer,
    category character varying(50),
    image_url character varying(200)
);


ALTER TABLE grocery_market.product OWNER TO divs;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: grocery_market; Owner: divs
--

CREATE SEQUENCE grocery_market.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE grocery_market.product_id_seq OWNER TO divs;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: grocery_market; Owner: divs
--

ALTER SEQUENCE grocery_market.product_id_seq OWNED BY grocery_market.product.id;


--
-- Name: user; Type: TABLE; Schema: grocery_market; Owner: divs
--

CREATE TABLE grocery_market."user" (
    id integer NOT NULL,
    email character varying(120) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(20),
    address character varying(200),
    phone character varying(20)
);


ALTER TABLE grocery_market."user" OWNER TO divs;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: grocery_market; Owner: divs
--

CREATE SEQUENCE grocery_market.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE grocery_market.user_id_seq OWNER TO divs;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: grocery_market; Owner: divs
--

ALTER SEQUENCE grocery_market.user_id_seq OWNED BY grocery_market."user".id;


--
-- Name: cart; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    user_id integer,
    is_active boolean
);


ALTER TABLE public.cart OWNER TO divs;

--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_id_seq OWNER TO divs;

--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: cart_item; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.cart_item (
    id integer NOT NULL,
    cart_id integer,
    product_id integer,
    quantity integer,
    price double precision
);


ALTER TABLE public.cart_item OWNER TO divs;

--
-- Name: cart_item_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.cart_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cart_item_id_seq OWNER TO divs;

--
-- Name: cart_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.cart_item_id_seq OWNED BY public.cart_item.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.category (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.category OWNER TO divs;

--
-- Name: category_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_id_seq OWNER TO divs;

--
-- Name: category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.category_id_seq OWNED BY public.category.id;


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.order_item (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public.order_item OWNER TO divs;

--
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_item_id_seq OWNER TO divs;

--
-- Name: order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.order_item_id_seq OWNED BY public.order_item.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(20),
    total_amount double precision NOT NULL,
    created_at timestamp without time zone,
    delivery_address character varying(200) NOT NULL
);


ALTER TABLE public.orders OWNER TO divs;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO divs;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.payment (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(100),
    status character varying(20),
    razorpay_order_id character varying(100),
    razorpay_payment_id character varying(100),
    razorpay_signature character varying(255),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.payment OWNER TO divs;

--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_id_seq OWNER TO divs;

--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price double precision NOT NULL,
    stock integer,
    image_url character varying(200),
    category_id integer NOT NULL
);


ALTER TABLE public.product OWNER TO divs;

--
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_id_seq OWNER TO divs;

--
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: divs
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying(120) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(20),
    address character varying(200),
    phone character varying(20)
);


ALTER TABLE public."user" OWNER TO divs;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: divs
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO divs;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: divs
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: order_item id; Type: DEFAULT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.order_item ALTER COLUMN id SET DEFAULT nextval('grocery_market.order_item_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.orders ALTER COLUMN id SET DEFAULT nextval('grocery_market.orders_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.payment ALTER COLUMN id SET DEFAULT nextval('grocery_market.payment_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.product ALTER COLUMN id SET DEFAULT nextval('grocery_market.product_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market."user" ALTER COLUMN id SET DEFAULT nextval('grocery_market.user_id_seq'::regclass);


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: cart_item id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart_item ALTER COLUMN id SET DEFAULT nextval('public.cart_item_id_seq'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.category ALTER COLUMN id SET DEFAULT nextval('public.category_id_seq'::regclass);


--
-- Name: order_item id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.order_item ALTER COLUMN id SET DEFAULT nextval('public.order_item_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- Name: product id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: grocery_market; Owner: divs
--

COPY grocery_market.order_item (id, order_id, product_id, quantity, price) FROM stdin;
8	8	1	1	2.5
9	8	2	1	2.5
10	8	3	1	2.5
11	8	3	1	2.5
12	8	4	1	100
13	8	4	1	100
14	8	5	1	40
15	9	1	1	2.5
16	9	2	1	2.5
17	9	3	1	2.5
18	9	3	1	2.5
19	9	4	1	100
20	9	4	1	100
21	9	5	1	40
22	10	1	1	2.5
23	10	2	1	2.5
24	10	3	1	2.5
25	10	3	1	2.5
26	10	4	1	100
27	10	4	1	100
28	10	5	1	40
29	11	1	1	2.5
30	11	2	1	2.5
31	11	3	1	2.5
32	11	3	1	2.5
33	11	4	1	100
34	11	4	1	100
35	11	5	1	40
36	12	1	1	2.5
37	12	2	1	2.5
38	12	3	1	2.5
39	12	3	1	2.5
40	12	4	1	100
41	12	4	1	100
42	12	5	1	40
43	13	1	1	2.5
44	13	2	1	2.5
45	13	3	1	2.5
46	13	3	1	2.5
47	13	4	1	100
48	13	5	1	40
49	14	1	1	2.5
50	14	2	1	2.5
51	14	1	1	2.5
52	14	1	1	2.5
53	14	3	1	2.5
54	14	3	1	2.5
55	14	4	1	100
56	14	5	1	40
57	14	1	1	2.5
58	15	1	1	2.5
59	15	1	1	2.5
60	15	2	1	2.5
61	15	3	1	2.5
62	16	1	1	2.5
63	16	1	1	2.5
64	16	2	1	2.5
65	16	3	1	2.5
66	17	1	1	2.5
67	17	2	1	2.5
68	17	3	1	2.5
69	18	1	1	2.5
70	18	2	1	2.5
71	18	3	1	2.5
72	19	1	1	2.5
73	19	2	1	2.5
74	19	3	1	2.5
75	20	1	1	2.5
76	20	2	1	2.5
77	20	3	1	2.5
78	20	4	1	100
79	20	5	1	40
80	21	1	1	2.5
81	21	2	1	2.5
82	21	3	1	2.5
83	21	4	1	100
84	21	5	1	40
85	22	1	1	2.5
86	22	1	1	2.5
87	22	2	1	2.5
88	22	2	1	2.5
89	22	4	1	100
90	22	4	1	100
91	22	6	1	10
92	22	6	1	10
93	23	1	1	2.5
94	23	2	1	2.5
95	23	3	1	2.5
96	24	1	1	2.5
97	24	2	1	2.5
98	24	3	1	2.5
99	25	3	1	2.5
100	25	2	1	2.5
101	25	1	1	2.5
102	26	3	1	2.5
103	26	2	1	2.5
104	26	1	1	2.5
105	27	3	1	2.5
106	27	2	1	2.5
107	27	1	1	2.5
108	28	3	1	2.5
109	28	2	1	2.5
110	28	1	1	2.5
111	29	1	1	2.5
112	29	1	1	2.5
113	29	2	1	2.5
114	30	1	1	2.5
115	30	2	1	2.5
116	31	1	1	2.5
117	31	2	1	2.5
118	32	1	1	2.5
119	33	1	1	2.5
120	33	1	1	2.5
121	34	1	1	2.5
122	35	1	1	2.5
123	36	1	1	2.5
124	37	1	1	2.5
125	38	1	1	2.5
126	39	1	1	2.5
127	40	2	1	2.5
128	41	2	1	2.5
129	42	1	2	9.99
130	43	1	1	2.5
131	43	1	1	2.5
132	43	2	1	2.5
133	43	3	1	2.5
134	43	4	1	100
135	44	1	2	9.99
136	45	1	1	2.5
137	46	1	1	2.5
138	47	1	1	2.5
139	48	1	1	2.5
140	49	1	1	2.5
141	50	1	1	2.5
142	50	2	1	2.5
143	50	3	1	2.5
144	50	4	1	100
145	51	1	1	2.5
146	51	2	1	2.5
147	51	3	1	2.5
148	51	4	1	100
149	51	5	1	40
150	51	19	1	4
151	51	20	1	23
152	51	1	1	2.5
153	52	1	1	2.5
154	52	2	1	2.5
155	52	3	1	2.5
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: grocery_market; Owner: divs
--

COPY grocery_market.orders (id, user_id, status, total_amount, created_at, delivery_address) FROM stdin;
18	1	pending	7.5	2025-04-02 16:49:49.045865	jhcjsc
19	1	pending	7.5	2025-04-02 16:56:53.531292	jhcjsc
20	1	pending	147.5	2025-04-02 17:04:12.016737	Koramanagala
21	1	pending	147.5	2025-04-02 17:09:21.301849	Koramanagala
12	1	confirmed	250	2025-04-01 18:25:16.338106	fbsjfbsjf
8	1	delivered	250	2025-04-01 18:24:32.933051	fbsjfbsjf
13	1	confirmed	150	2025-04-01 19:29:06.488304	bcvsjvhbs
10	1	delivered	250	2025-04-01 18:25:15.499774	fbsjfbsjf
22	1	pending	230	2025-04-02 18:31:14.792749	bcsjhcbsjjs
23	1	pending	7.5	2025-04-04 17:28:00.057498	koramangala
24	1	pending	7.5	2025-04-04 17:28:01.530714	koramangala
25	1	pending	7.5	2025-04-04 17:36:13.254155	sjcskjv
26	1	pending	7.5	2025-04-04 17:36:18.963106	sjcskjv
27	1	pending	7.5	2025-04-04 17:36:22.052006	sjcskjv
28	1	pending	7.5	2025-04-04 17:36:25.774477	sjcskjv
29	1	pending	7.5	2025-04-04 17:40:54.783847	dcbdsjhvb
30	1	pending	5	2025-04-04 17:46:31.113951	jhkjzd
31	1	pending	5	2025-04-04 17:47:57.427708	jhkjzd
32	1	pending	2.5	2025-04-04 17:52:24.698807	afbshjd
33	1	pending	5	2025-04-04 18:06:08.23957	dmncsmn
34	1	pending	2.5	2025-04-04 18:13:42.039957	sdbcj
35	1	pending	2.5	2025-04-04 18:20:11.009039	gifs
36	1	pending	2.5	2025-04-04 18:23:58.569372	gifs
37	1	pending	2.5	2025-04-04 18:27:28.735313	dgbd
38	1	pending	2.5	2025-04-04 18:37:59.429998	dgbd
39	1	pending	2.5	2025-04-04 18:38:04.766864	dgbd
15	1	Paid	10	2025-04-02 16:24:21.319483	gdsuhsh
40	1	pending	2.5	2025-04-04 19:02:52.107442	dnvbdj
41	1	pending	2.5	2025-04-04 19:17:58.417673	dnvbdj
14	1	Paid	157.5	2025-04-02 16:16:12.584893	jshfsjfhs
42	1	pending	19.99	2025-04-06 15:31:52.472295	456 Another Street
43	1	pending	110	2025-04-06 15:32:17.636607	jfnsjfnkjnvdfkjvndkjf
9	1	confirmed	250	2025-04-01 18:25:14.413966	fbsjfbsjf
16	1	confirmed	10	2025-04-02 16:24:22.439787	gdsuhsh
11	1	confirmed	250	2025-04-01 18:25:16.135704	fbsjfbsjf
17	1	delivered	7.5	2025-04-02 16:49:47.973633	jhcjsc
44	2	pending	19.99	2025-04-24 07:59:11.916267	456 Another Street
45	1	pending	2.5	2025-04-24 12:39:02.776755	dvdd
46	1	pending	2.5	2025-04-24 12:39:42.450605	cd
47	2	pending	2.5	2025-04-24 12:41:03.537516	dads
48	1	pending	2.5	2025-04-24 19:08:42.873499	sods
49	3	pending	2.5	2025-04-25 18:20:52.512022	sfs
50	1	pending	107.5	2025-04-25 18:22:09.925145	ssdsdsdcs
51	3	pending	177	2025-04-27 05:24:25.621424	koeyqwewh
52	3	pending	7.5	2025-04-27 05:25:05.10501	sbsdn
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: grocery_market; Owner: divs
--

COPY grocery_market.payment (id, order_id, amount, status, payment_method, transaction_id, created_at, user_id) FROM stdin;
1	15	10	Completed	upi	eae96fcc-d5d6-417c-9abe-cc8d3282e933	2025-04-04 19:01:09.249811	1
2	14	157.5	Completed	upi	TXNC605A1FB5430	2025-04-06 14:50:55.30212	1
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: grocery_market; Owner: divs
--

COPY grocery_market.product (id, name, description, price, stock, category, image_url) FROM stdin;
1	Apple	Fresh red apple	2.5	100	Fruits	apple.jpg
2	Apple	Fresh red apple	2.5	100	Fruits	apple.jpg
3	Banana	Fresh red apple	2.5	100	Fruits	apple.jpg
4	Apples	these are Kashmir apples	100	10000	fruits	\N
5	rice	grocery	40	40	daily items	\N
6	Eggs	eggs	10	10	breakable	\N
7	This is a new product I am going to sell	its great	10000	13	Great Category	\N
9	jfjh	dmnvbdnm	12	12	mdvd	\N
12	dvmnsd	sds	12	12	sfs	\N
13	vghv	vbb	67	78	cvfgt	\N
15	nanana	nanana	3	3	nna	\N
18	dvd	dd	23	34	ert	\N
19	cd	cd	4	3	d	\N
20	Feds	funds	23	45	dandy	\N
21	djshbsd	sods	34	45	dgdf	\N
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: grocery_market; Owner: divs
--

COPY grocery_market."user" (id, email, password, name, role, address, phone) FROM stdin;
1	user@example.com	scrypt:32768:8:1$MU9Bep6KNLWennu0$2b16b0a4c553d39946024d9606159e5b4edfdbae46f7b6dcfca9bfca18ed0a9bb34206d02cf5600402dc55e3410ec6bb7c32510b89235e3e6840363f14f6d576	John Doe	customer	123 Main St	1234567890
2	admin@example.com	scrypt:32768:8:1$M0cB5daPcC69xixr$d4e911c881defca1d0ce76ec68c975bc6ca92283894e612fbb43a0dc09529d5e1e9ebb9b485c78e1a3215fcf0cb560b0a36d4b7bb681fe24fb79423484cbd40f	John Doe	customer	123 Main St	123456789
3	admin1@example.com	scrypt:32768:8:1$j8K1TcAKs3ykzuHh$1c0651107bc91bf29e4e22a027a0bc415d9aade4af722a1ff62cf79e72217220cbffa9cc70fc8d9be290084c6ce957caab1ca0d9b90e1e01e70ac0ca9c3654a3	John Doe	Admin	123 Main St	123456789
5	admin2@example.com	scrypt:32768:8:1$dJwazrLY4DskfCIa$fefe4ae47bbbbb37d070b09370ee7396572b694d34afe314cf43f671a42279f183d46d4d4cb149e001fb17d577db4e1194aeb5be8b819a57f82f0589f9834dd9	John Doe	Admin	123 Main St	123456789
6	user11@example.com	scrypt:32768:8:1$YRn692dDlNE3LNIV$1583351515c704acb5d6a4b30e4bd8942a5ff53d6a048d9b8b13a7238c37d0eefba28044951eb3f135aca156a6601b53a1ccddc33b8a685c73234b4d1ba8c9cd	John Doe	Admin	123 Street Name	1234567890
7		scrypt:32768:8:1$L6y4rpPRBuNXN98n$4d72c0c6450ebf509601c747afec04db89cbba612e2ab04d09a1239a6a3c52f4007d5fa61caf5be388853424d793774c93d3e15bfc13579da15145098b31647c		customer		
8	abc	scrypt:32768:8:1$Fkk45dIE08WEAVKx$4bc1cf6d81633e48502098c22f4ce361562d83492dedeff14ba064fa48d8e204beaa7a0328127cd74a225891c09aa7aad6a59d1393b14618d7cf61e1a2d710da	abc	Admin	werrty	1234556
10	cvb	scrypt:32768:8:1$6f2zkEde31iqSTB2$e39823bde573f1c6f495510e88786751cb59c3edbdc26e6b48dc81e86143da2ff4fcda79320685b0cfad5946ecde580d656aa40a48efccaa93ed276aa47db966	cvb	customer	123	1234
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.cart (id, user_id, is_active) FROM stdin;
1	3	f
2	3	f
\.


--
-- Data for Name: cart_item; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.cart_item (id, cart_id, product_id, quantity, price) FROM stdin;
1	1	1	1	99.99
2	2	1	1	99.99
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.category (id, name, description) FROM stdin;
1	Fruits	\N
2	Dairy	\N
3	Veggies	\N
4	rteoiw	\N
5	cosmic	\N
6	jsfj	\N
7	Great	\N
8	daf	\N
\.


--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.order_item (id, order_id, product_id, quantity, price) FROM stdin;
152	20	3	3	120
156	21	6	4	1380
128	10	1	15	675
127	10	2	6	468
129	10	3	1	40
134	11	6	2	690
132	11	4	3	135
133	11	5	5	225
135	11	8	3	102
136	11	9	2	912
137	11	10	4	180
130	11	2	1	78
131	11	3	5	200
138	12	5	41	1845
139	13	3	2	80
140	14	2	1	78
141	15	3	2	80
142	15	6	2	690
143	16	3	2	80
144	17	3	1	40
145	18	2	1	78
147	18	6	1	345
146	18	3	9	360
148	18	4	4	180
149	19	2	2	156
151	20	8	1	34
153	20	6	7	2415
150	20	4	2	90
155	20	2	1	78
154	20	10	2	90
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.orders (id, user_id, status, total_amount, created_at, delivery_address) FROM stdin;
8	3	out_for_delivery	2025	2025-05-21 17:47:54.128483	sd
11	6	paid	2522	2025-06-10 02:27:25.318209	Default Address
12	6	paid	1845	2025-06-15 15:43:42.482402	fvfddjm
13	6	paid	80	2025-06-16 02:28:28.477369	def
14	6	paid	78	2025-06-19 05:03:17.009248	f,gmn
15	6	paid	770	2025-06-19 07:23:43.112548	Default Address
17	6	paid	40	2025-06-20 14:51:50.673166	gdg
19	4	out_for_delivery	156	2025-06-21 08:53:25.437967	Default Address
20	6	out_for_delivery	2827	2025-06-23 17:51:25.655117	Default Address
10	3	out_for_delivery	1183	2025-05-22 18:05:54.382193	Default Address
16	7	out_for_delivery	80	2025-06-20 04:41:35.18325	debts
18	8	delivered	963	2025-06-21 03:12:41.092142	Default Address
21	6	delivery_failed	1380	2025-07-19 19:39:44.391243	dkjjk
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.payment (id, user_id, order_id, amount, payment_method, transaction_id, status, razorpay_order_id, razorpay_payment_id, razorpay_signature, created_at, updated_at) FROM stdin;
2	6	14	78.00	razorpay	\N	initiated	order_QivtVe6dv2o6JS	\N	\N	2025-06-19 05:03:18.334682	2025-06-19 05:04:59.892965
1	6	13	80.00	razorpay	\N	initiated	order_QiwPLKeqNoDsYL	\N	\N	2025-06-17 17:55:21.775811	2025-06-19 05:35:08.186923
3	6	15	770.00	razorpay	\N	initiated	order_QiyYB71BZ8k2ii	\N	\N	2025-06-19 07:24:41.653607	2025-06-19 07:40:53.216821
4	7	16	80.00	upi	\N	initiated	order_QjK1waz6rFKZUg	\N	\N	2025-06-20 04:41:37.827584	2025-06-20 04:41:38.076968
5	6	17	40.00	razorpay	\N	initiated	order_QjVf5huCxQZYw9	\N	\N	2025-06-20 14:52:07.598468	2025-06-20 16:04:19.11572
6	8	18	78.00	razorpay	\N	initiated	order_Qjh39YguvmqUKC	\N	\N	2025-06-21 03:12:43.55451	2025-06-21 03:12:43.554521
7	6	20	2827.00	razorpay	\N	initiated	order_Qr3yBpFuyTkTP7	\N	\N	2025-06-25 16:14:58.529979	2025-07-09 18:10:59.635687
8	6	21	1380.00	razorpay	\N	initiated	order_Qv2pCDorw9CesC	\N	\N	2025-07-19 19:39:47.587464	2025-07-19 19:39:47.587477
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public.product (id, name, description, price, stock, image_url, category_id) FROM stdin;
3	Milk	MIlp Packets	40	450	\N	2
6	sums	syncs	345	456	\N	1
2	jackfruit	vcgh	78	897089	\N	1
4	secs	smcns	45	34560	\N	1
1	Apple	sms	45	33598	\N	1
5	snsd	sds	45	45	\N	1
8	ams	dfs	34	4567		1
9	did	add	456	56		1
10	Fruitsses	seeds	45	567		1
14	sd	sdds	2	2		1
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: divs
--

COPY public."user" (id, email, password, name, role, address, phone) FROM stdin;
1	divya@example.com	scrypt:32768:8:1$utzttLjARMHTFkFM$e82b75cc44a530ea9ebd573c4aac9e727f39ffd634b70fdfae75dbe4af310c24962b1055acb42434c62073c7f81ba5edd4c8e019f09c5db42c5149ca065eff5f	divya	Customer	Kora	897353
3	div@example.com	scrypt:32768:8:1$Lti7D93wzAR2L42h$f49f3f4ee14c8eafb6e46459a1986fc45770175358ef918f31c255a285da7f2fa8e0c7406131780d4c0997f1ceca97aad2c9bbd6fb093ada3ea476ede21ea9c6	divya1	Customer	fnbd	3435
4	admin@example.com	scrypt:32768:8:1$MRCl7Z48Rvot34le$2fc57994211888c7a83887a8900812634ea3f17f93946fda5e9e32c15a1ab1a9003ca518abfea1ffc0c198f4bb00ce1b9e19b25f2854ef7c1a6169b462a64e00	admin	Admin	Kora	344387687
5	delivery@example.com	scrypt:32768:8:1$9X7WppZCKONaHuZm$f2049ecb99fb00a2709501e641f8d23747c3e2bb3b142bf90f98945f87abcbd4f3f85ca0d5192802e8a7afe067ef9b4e8ecf18431f9206b4c582b491d6e4af61	delivery	Delivery	kora	67889
6	customer@example.com	scrypt:32768:8:1$C6fMymDfS30CgIpP$473f9dc49bd7272ba3dda81d7293e532e898881b1dfec339a3117341c5a997fdd773b8bac7d969025e2eac5be909029c395185752fd1f5f89e00ae5ab891994e	customer	Customer	djgdk	4385
7	kirana@example.com	scrypt:32768:8:1$MIlm745OvlZHfGU1$175ed23f010b5795814cfe53cfa26fd4f6d25eedd4282ed2d3e2bb0522891d448e89b2a1032f44cb91677d1766123e7d9909d5ebcabaabb501780917df35e6f1	kirana	Customer	sjdksj	34739
10	admin1@example.com	scrypt:32768:8:1$RJxqwMbB4lHcU5u0$4ddb73a0bd72c861b5245cbd4afe34dac1421fd5a8e107400a748f0c03845d2d249adf71a977e6bd0fc7db9e7ad732efa3c82487a7df7ed20b24a2e1386e2f9e	admin1	Admin	sjk	242
8	kamala@example.com	scrypt:32768:8:1$WSQdGz0TmsDQ4Ttg$98f76716e0747b0f64aa7ceb22e84fa3c4f743d12d274998bd4ae31eadc0dbba1e5872e4b86498b2a9935bbde2d20aac7085611840951e107647daf7c5980a58	Kamala	Delivery	hd	363783
\.


--
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: grocery_market; Owner: divs
--

SELECT pg_catalog.setval('grocery_market.order_item_id_seq', 155, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: grocery_market; Owner: divs
--

SELECT pg_catalog.setval('grocery_market.orders_id_seq', 52, true);


--
-- Name: payment_id_seq; Type: SEQUENCE SET; Schema: grocery_market; Owner: divs
--

SELECT pg_catalog.setval('grocery_market.payment_id_seq', 2, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: grocery_market; Owner: divs
--

SELECT pg_catalog.setval('grocery_market.product_id_seq', 21, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: grocery_market; Owner: divs
--

SELECT pg_catalog.setval('grocery_market.user_id_seq', 10, true);


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.cart_id_seq', 2, true);


--
-- Name: cart_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.cart_item_id_seq', 2, true);


--
-- Name: category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.category_id_seq', 8, true);


--
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.order_item_id_seq', 156, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.orders_id_seq', 21, true);


--
-- Name: payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.payment_id_seq', 8, true);


--
-- Name: product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.product_id_seq', 15, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: divs
--

SELECT pg_catalog.setval('public.user_id_seq', 10, true);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment payment_order_id_key; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.payment
    ADD CONSTRAINT payment_order_id_key UNIQUE (order_id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (id);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: category category_name_key; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_key UNIQUE (name);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES grocery_market.orders(id);


--
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES grocery_market.product(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES grocery_market."user"(id);


--
-- Name: payment payment_order_id_fkey; Type: FK CONSTRAINT; Schema: grocery_market; Owner: divs
--

ALTER TABLE ONLY grocery_market.payment
    ADD CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES grocery_market.orders(id);


--
-- Name: cart_item cart_item_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id);


--
-- Name: cart_item cart_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_item order_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: payment payment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: payment payment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: product product_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: divs
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id);


--
-- PostgreSQL database dump complete
--

