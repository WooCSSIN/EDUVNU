-- TẬP LỆNH TẠO BẢNG CƠ SỞ DỮ LIỆU DÀNH CHO SQL SERVER (SSMS)
-- DỰ ÁN: EDUVNU

CREATE TABLE [accounts_user] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [password] nvarchar(128) NOT NULL, [last_login] datetimeoffset NULL, [is_superuser] bit NOT NULL, [username] nvarchar(150) NOT NULL UNIQUE, [first_name] nvarchar(150) NOT NULL, [last_name] nvarchar(150) NOT NULL, [email] nvarchar(254) NOT NULL, [is_staff] bit NOT NULL, [is_active] bit NOT NULL, [date_joined] datetimeoffset NOT NULL, [is_instructor] bit NOT NULL, [is_student] bit NOT NULL, [avatar] nvarchar(100) NULL, [bio] nvarchar(max) NULL, [expertise] nvarchar(255) NULL, [birthday] date NULL, [phone] nvarchar(20) NULL, [gender] nvarchar(10) NULL, [is_email_verified] bit NULL);;
GO

CREATE TABLE [accounts_user_groups] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [group_id] int NOT NULL);;
GO

CREATE TABLE [accounts_user_user_permissions] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [permission_id] int NOT NULL);;
GO

CREATE TABLE [courses_category] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [name] nvarchar(100) NOT NULL, [description] nvarchar(max) NOT NULL, [is_active] bit NOT NULL, [created_by_id] bigint NULL);;
GO

CREATE TABLE [courses_course] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [title] nvarchar(255) NOT NULL, [description] nvarchar(max) NOT NULL, [price] numeric(10, 2) NOT NULL, [original_price] numeric(10, 2) NULL, [image] nvarchar(100) NULL, [category_id] bigint NULL, [status] nvarchar(20) NOT NULL, [rejection_reason] nvarchar(max) NULL, [start_date] date NULL, [end_date] date NULL, [visibility_status] nvarchar(20) NOT NULL, [level] nvarchar(50) NULL, [rating_avg] double precision NOT NULL, [num_reviews] int NOT NULL, [skills] nvarchar(max) NULL, [duration] nvarchar(100) NULL, [partner_name] nvarchar(255) NULL, [objective] nvarchar(max) NULL, [subject_code] nvarchar(20) NULL, [faculty] nvarchar(255) NULL, [instructor_id] bigint NULL, [is_active] bit NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_chapter] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [course_id] bigint NOT NULL, [title] nvarchar(255) NOT NULL, [order] int NOT NULL CONSTRAINT courses_chapter_order_b9ff7429_check CHECK ([order] >= 0), [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_quiz] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [chapter_id] bigint NOT NULL UNIQUE, [title] nvarchar(255) NOT NULL, [description] nvarchar(max) NULL, [passing_score] int NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_question] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [quiz_id] bigint NOT NULL, [text] nvarchar(max) NOT NULL, [order] int NOT NULL CONSTRAINT courses_question_order_087574ce_check CHECK ([order] >= 0));;
GO

CREATE TABLE [courses_choice] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [question_id] bigint NOT NULL, [text] nvarchar(255) NOT NULL, [is_correct] bit NOT NULL);;
GO

CREATE TABLE [courses_quizattempt] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [quiz_id] bigint NOT NULL, [score] double precision NOT NULL, [passed] bit NOT NULL, [draft_answers] nvarchar(max) NULL CONSTRAINT courses_quizattempt_draft_answers_dbbb4f66_check CHECK ((ISJSON ("draft_answers") = 1)), [is_submitted] bit NOT NULL, [attempted_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_lesson] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [course_id] bigint NOT NULL, [chapter_id] bigint NULL, [title] nvarchar(255) NOT NULL, [order_number] int NOT NULL CONSTRAINT courses_lesson_order_number_c57fa89d_check CHECK ([order_number] >= 0), [video_url] nvarchar(255) NULL, [document_file] nvarchar(100) NULL, [content] nvarchar(max) NOT NULL, [is_active] bit NOT NULL);;
GO

CREATE TABLE [courses_lessoncomment] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [lesson_id] bigint NOT NULL, [user_id] bigint NOT NULL, [content] nvarchar(max) NOT NULL, [created_at] datetimeoffset NOT NULL, [updated_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_enrollment] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [course_id] bigint NOT NULL, [enrolled_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_userprogress] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [lesson_id] bigint NOT NULL, [status] nvarchar(20) NOT NULL, [time_spent] int NOT NULL CONSTRAINT courses_userprogress_time_spent_c0d173b9_check CHECK ([time_spent] >= 0), [last_accessed] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_review] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [course_id] bigint NOT NULL, [rating] int NOT NULL, [comment] nvarchar(max) NOT NULL, [instructor_reply] nvarchar(max) NULL, [replied_at] datetimeoffset NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_contactmessage] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [name] nvarchar(100) NOT NULL, [email] nvarchar(254) NOT NULL, [subject] nvarchar(200) NOT NULL, [message] nvarchar(max) NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_certificate] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [enrollment_id] bigint NOT NULL UNIQUE, [certificate_id] char(32) NOT NULL UNIQUE, [issued_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_instructorwallet] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL UNIQUE, [balance] numeric(15, 2) NOT NULL, [bank_name] nvarchar(100) NULL, [account_number] nvarchar(50) NULL, [account_holder] nvarchar(100) NULL);;
GO

CREATE TABLE [courses_wallettransaction] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [wallet_id] bigint NOT NULL, [amount] numeric(15, 2) NOT NULL, [transaction_type] nvarchar(20) NOT NULL, [description] nvarchar(max) NULL, [order_item_id] bigint NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_withdrawalrequest] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [amount] numeric(12, 2) NOT NULL, [status] nvarchar(20) NOT NULL, [note] nvarchar(max) NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_courseannouncement] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [course_id] bigint NOT NULL, [title] nvarchar(255) NOT NULL, [content] nvarchar(max) NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_notification] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [title] nvarchar(255) NOT NULL, [message] nvarchar(max) NOT NULL, [is_read] bit NOT NULL, [link] nvarchar(255) NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_news] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [title] nvarchar(255) NOT NULL, [content] nvarchar(max) NOT NULL, [image] nvarchar(100) NULL, [author_id] bigint NULL, [is_published] bit NOT NULL, [created_at] datetimeoffset NOT NULL, [updated_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_faq] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [question] nvarchar(255) NOT NULL, [answer] nvarchar(max) NOT NULL, [order] int NOT NULL CONSTRAINT courses_faq_order_6b9b599d_check CHECK ([order] >= 0), [is_active] bit NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [courses_degreeprogram] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [level] nvarchar(100) NOT NULL, [subject] nvarchar(100) NOT NULL, [school] nvarchar(200) NOT NULL, [title] nvarchar(255) NOT NULL, [deadline] nvarchar(100) NOT NULL, [duration] nvarchar(100) NOT NULL, [tuition] nvarchar(100) NOT NULL, [logo] nvarchar(50) NOT NULL, [instructor] nvarchar(200) NULL, [instructor_title] nvarchar(200) NULL, [skills] nvarchar(max) NOT NULL CONSTRAINT courses_degreeprogram_skills_c0713140_check CHECK ((ISJSON ("skills") = 1)), [curriculum] nvarchar(max) NOT NULL CONSTRAINT courses_degreeprogram_curriculum_55baa152_check CHECK ((ISJSON ("curriculum") = 1)), [videos] nvarchar(max) NOT NULL CONSTRAINT courses_degreeprogram_videos_2cd269ce_check CHECK ((ISJSON ("videos") = 1)), [created_at] datetimeoffset NOT NULL, [is_active] bit NOT NULL);;
GO

CREATE TABLE [cart_cart] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL UNIQUE);;
GO

CREATE TABLE [cart_cartitem] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [cart_id] bigint NOT NULL, [course_id] bigint NOT NULL);;
GO

CREATE TABLE [orders_order] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [user_id] bigint NOT NULL, [total_price] numeric(10, 2) NOT NULL, [payment_method] nvarchar(50) NULL, [transaction_id] nvarchar(100) NULL, [paid_at] datetimeoffset NULL, [status] nvarchar(20) NOT NULL, [created_at] datetimeoffset NOT NULL);;
GO

CREATE TABLE [orders_orderitem] ([id] bigint NOT NULL PRIMARY KEY IDENTITY (1, 1), [order_id] bigint NOT NULL, [course_id] bigint NOT NULL, [price] numeric(10, 2) NOT NULL);;
GO

CREATE INDEX [courses_lessoncomment_user_id_eb4682b8] ON [courses_lessoncomment] ([user_id]);;
GO

CREATE INDEX [orders_orderitem_order_id_fe61a34d] ON [orders_orderitem] ([order_id]);;
GO

CREATE INDEX [courses_lesson_course_id_16bc4882] ON [courses_lesson] ([course_id]);;
GO

CREATE INDEX [courses_withdrawalrequest_user_id_9ef8bbc6] ON [courses_withdrawalrequest] ([user_id]);;
GO

CREATE INDEX [courses_enrollment_course_id_2631503e] ON [courses_enrollment] ([course_id]);;
GO

CREATE INDEX [courses_course_instructor_id_5b0643dc] ON [courses_course] ([instructor_id]);;
GO

CREATE INDEX [accounts_user_user_permissions_permission_id_113bb443] ON [accounts_user_user_permissions] ([permission_id]);;
GO

ALTER TABLE [courses_category] ADD CONSTRAINT [courses_category_created_by_id_1d6798ed_fk_accounts_user_id] FOREIGN KEY ([created_by_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [courses_userprogress_lesson_id_cb8dadec] ON [courses_userprogress] ([lesson_id]);;
GO

ALTER TABLE [accounts_user_user_permissions] ADD CONSTRAINT [accounts_user_user_permissions_permission_id_113bb443_fk_auth_permission_id] FOREIGN KEY ([permission_id]) REFERENCES [auth_permission] ([id]);;
GO

CREATE UNIQUE INDEX [courses_userprogress_user_id_lesson_id_443e7844_uniq] ON [courses_userprogress] ([user_id], [lesson_id]) WHERE [user_id] IS NOT NULL AND [lesson_id] IS NOT NULL;;
GO

ALTER TABLE [courses_wallettransaction] ADD CONSTRAINT [courses_wallettransaction_order_item_id_9fe5c7b1_fk_orders_orderitem_id] FOREIGN KEY ([order_item_id]) REFERENCES [orders_orderitem] ([id]);;
GO

ALTER TABLE [courses_news] ADD CONSTRAINT [courses_news_author_id_606de3dd_fk_accounts_user_id] FOREIGN KEY ([author_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [accounts_user_groups] ADD CONSTRAINT [accounts_user_groups_group_id_bd11a704_fk_auth_group_id] FOREIGN KEY ([group_id]) REFERENCES [auth_group] ([id]);;
GO

CREATE INDEX [courses_question_quiz_id_7bd87b34] ON [courses_question] ([quiz_id]);;
GO

ALTER TABLE [cart_cartitem] ADD CONSTRAINT [cart_cartitem_course_id_3fb6fc6f_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

ALTER TABLE [courses_userprogress] ADD CONSTRAINT [courses_userprogress_user_id_b4dcd58f_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [courses_certificate] ADD CONSTRAINT [courses_certificate_enrollment_id_b4d6cdb3_fk_courses_enrollment_id] FOREIGN KEY ([enrollment_id]) REFERENCES [courses_enrollment] ([id]);;
GO

CREATE INDEX [courses_quizattempt_user_id_c8575b36] ON [courses_quizattempt] ([user_id]);;
GO

CREATE INDEX [courses_lesson_chapter_id_401d021a] ON [courses_lesson] ([chapter_id]);;
GO

ALTER TABLE [courses_enrollment] ADD CONSTRAINT [courses_enrollment_user_id_da3de16f_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [courses_chapter] ADD CONSTRAINT [courses_chapter_course_id_24d15099_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

ALTER TABLE [courses_courseannouncement] ADD CONSTRAINT [courses_courseannouncement_course_id_59f3b10d_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

CREATE INDEX [orders_orderitem_course_id_f312f91f] ON [orders_orderitem] ([course_id]);;
GO

CREATE INDEX [accounts_user_groups_group_id_bd11a704] ON [accounts_user_groups] ([group_id]);;
GO

CREATE UNIQUE INDEX [accounts_user_groups_user_id_group_id_59c0b32f_uniq] ON [accounts_user_groups] ([user_id], [group_id]) WHERE [user_id] IS NOT NULL AND [group_id] IS NOT NULL;;
GO

CREATE INDEX [orders_order_user_id_e9b59eb1] ON [orders_order] ([user_id]);;
GO

CREATE INDEX [accounts_user_groups_user_id_52b62117] ON [accounts_user_groups] ([user_id]);;
GO

CREATE UNIQUE INDEX [cart_cartitem_cart_id_course_id_73c71fe7_uniq] ON [cart_cartitem] ([cart_id], [course_id]) WHERE [cart_id] IS NOT NULL AND [course_id] IS NOT NULL;;
GO

ALTER TABLE [courses_choice] ADD CONSTRAINT [courses_choice_question_id_e3bc6751_fk_courses_question_id] FOREIGN KEY ([question_id]) REFERENCES [courses_question] ([id]);;
GO

CREATE INDEX [courses_quizattempt_quiz_id_b289d1d8] ON [courses_quizattempt] ([quiz_id]);;
GO

ALTER TABLE [courses_lessoncomment] ADD CONSTRAINT [courses_lessoncomment_lesson_id_d06cc1bc_fk_courses_lesson_id] FOREIGN KEY ([lesson_id]) REFERENCES [courses_lesson] ([id]);;
GO

CREATE INDEX [courses_category_created_by_id_1d6798ed] ON [courses_category] ([created_by_id]);;
GO

CREATE INDEX [courses_wallettransaction_wallet_id_0bcd7517] ON [courses_wallettransaction] ([wallet_id]);;
GO

ALTER TABLE [courses_userprogress] ADD CONSTRAINT [courses_userprogress_lesson_id_cb8dadec_fk_courses_lesson_id] FOREIGN KEY ([lesson_id]) REFERENCES [courses_lesson] ([id]);;
GO

ALTER TABLE [accounts_user_groups] ADD CONSTRAINT [accounts_user_groups_user_id_52b62117_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [courses_news_author_id_606de3dd] ON [courses_news] ([author_id]);;
GO

CREATE INDEX [courses_chapter_course_id_24d15099] ON [courses_chapter] ([course_id]);;
GO

ALTER TABLE [courses_enrollment] ADD CONSTRAINT [courses_enrollment_course_id_2631503e_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

ALTER TABLE [courses_course] ADD CONSTRAINT [courses_course_category_id_d64b93bf_fk_courses_category_id] FOREIGN KEY ([category_id]) REFERENCES [courses_category] ([id]);;
GO

ALTER TABLE [orders_orderitem] ADD CONSTRAINT [orders_orderitem_order_id_fe61a34d_fk_orders_order_id] FOREIGN KEY ([order_id]) REFERENCES [orders_order] ([id]);;
GO

ALTER TABLE [courses_instructorwallet] ADD CONSTRAINT [courses_instructorwallet_user_id_491c08d5_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [courses_review] ADD CONSTRAINT [courses_review_course_id_536a14f9_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

CREATE UNIQUE INDEX [courses_enrollment_user_id_course_id_7c8ca1bf_uniq] ON [courses_enrollment] ([user_id], [course_id]) WHERE [user_id] IS NOT NULL AND [course_id] IS NOT NULL;;
GO

CREATE INDEX [courses_courseannouncement_course_id_59f3b10d] ON [courses_courseannouncement] ([course_id]);;
GO

CREATE INDEX [courses_choice_question_id_e3bc6751] ON [courses_choice] ([question_id]);;
GO

ALTER TABLE [courses_lesson] ADD CONSTRAINT [courses_lesson_course_id_16bc4882_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

ALTER TABLE [cart_cart] ADD CONSTRAINT [cart_cart_user_id_9b4220b9_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [courses_wallettransaction_order_item_id_9fe5c7b1] ON [courses_wallettransaction] ([order_item_id]);;
GO

ALTER TABLE [courses_lessoncomment] ADD CONSTRAINT [courses_lessoncomment_user_id_eb4682b8_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [cart_cartitem_cart_id_370ad265] ON [cart_cartitem] ([cart_id]);;
GO

ALTER TABLE [accounts_user_user_permissions] ADD CONSTRAINT [accounts_user_user_permissions_user_id_e4f0a161_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE UNIQUE INDEX [accounts_user_user_permissions_user_id_permission_id_2ab516c2_uniq] ON [accounts_user_user_permissions] ([user_id], [permission_id]) WHERE [user_id] IS NOT NULL AND [permission_id] IS NOT NULL;;
GO

ALTER TABLE [courses_course] ADD CONSTRAINT [courses_course_instructor_id_5b0643dc_fk_accounts_user_id] FOREIGN KEY ([instructor_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [courses_quiz] ADD CONSTRAINT [courses_quiz_chapter_id_970041b9_fk_courses_chapter_id] FOREIGN KEY ([chapter_id]) REFERENCES [courses_chapter] ([id]);;
GO

ALTER TABLE [courses_notification] ADD CONSTRAINT [courses_notification_user_id_7cc5ad38_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [courses_review_course_id_536a14f9] ON [courses_review] ([course_id]);;
GO

ALTER TABLE [courses_quizattempt] ADD CONSTRAINT [courses_quizattempt_user_id_c8575b36_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [orders_orderitem] ADD CONSTRAINT [orders_orderitem_course_id_f312f91f_fk_courses_course_id] FOREIGN KEY ([course_id]) REFERENCES [courses_course] ([id]);;
GO

ALTER TABLE [courses_withdrawalrequest] ADD CONSTRAINT [courses_withdrawalrequest_user_id_9ef8bbc6_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

ALTER TABLE [courses_lesson] ADD CONSTRAINT [courses_lesson_chapter_id_401d021a_fk_courses_chapter_id] FOREIGN KEY ([chapter_id]) REFERENCES [courses_chapter] ([id]);;
GO

CREATE INDEX [courses_review_user_id_5a028109] ON [courses_review] ([user_id]);;
GO

CREATE INDEX [cart_cartitem_course_id_3fb6fc6f] ON [cart_cartitem] ([course_id]);;
GO

ALTER TABLE [courses_wallettransaction] ADD CONSTRAINT [courses_wallettransaction_wallet_id_0bcd7517_fk_courses_instructorwallet_id] FOREIGN KEY ([wallet_id]) REFERENCES [courses_instructorwallet] ([id]);;
GO

CREATE INDEX [courses_lessoncomment_lesson_id_d06cc1bc] ON [courses_lessoncomment] ([lesson_id]);;
GO

CREATE INDEX [courses_enrollment_user_id_da3de16f] ON [courses_enrollment] ([user_id]);;
GO

CREATE INDEX [courses_course_category_id_d64b93bf] ON [courses_course] ([category_id]);;
GO

CREATE INDEX [accounts_user_user_permissions_user_id_e4f0a161] ON [accounts_user_user_permissions] ([user_id]);;
GO

CREATE INDEX [courses_userprogress_user_id_b4dcd58f] ON [courses_userprogress] ([user_id]);;
GO

ALTER TABLE [courses_question] ADD CONSTRAINT [courses_question_quiz_id_7bd87b34_fk_courses_quiz_id] FOREIGN KEY ([quiz_id]) REFERENCES [courses_quiz] ([id]);;
GO

ALTER TABLE [cart_cartitem] ADD CONSTRAINT [cart_cartitem_cart_id_370ad265_fk_cart_cart_id] FOREIGN KEY ([cart_id]) REFERENCES [cart_cart] ([id]);;
GO

ALTER TABLE [courses_review] ADD CONSTRAINT [courses_review_user_id_5a028109_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

CREATE INDEX [courses_notification_user_id_7cc5ad38] ON [courses_notification] ([user_id]);;
GO

ALTER TABLE [courses_quizattempt] ADD CONSTRAINT [courses_quizattempt_quiz_id_b289d1d8_fk_courses_quiz_id] FOREIGN KEY ([quiz_id]) REFERENCES [courses_quiz] ([id]);;
GO

ALTER TABLE [orders_order] ADD CONSTRAINT [orders_order_user_id_e9b59eb1_fk_accounts_user_id] FOREIGN KEY ([user_id]) REFERENCES [accounts_user] ([id]);;
GO

