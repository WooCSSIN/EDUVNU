CREATE DATABASE PEAK_COURSE;
GO

USE PEAK_COURSE;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE,
    email VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(20) CHECK (role IN ('admin', 'instructor', 'student')) DEFAULT 'student',
    is_active BIT DEFAULT 1, -- Soft Delete
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100), -- Hỗ trợ tiếng Việt
    description NVARCHAR(MAX), -- Thay thế TEXT bằng NVARCHAR(MAX)
    is_active BIT DEFAULT 1 -- Soft Delete
);

CREATE TABLE courses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255), -- Hỗ trợ tiếng Việt
    instructor_id INT, 
    description NVARCHAR(MAX), -- Thay thế TEXT bằng NVARCHAR(MAX)
    price DECIMAL(10,2),
    image VARCHAR(255),
    category_id INT,
    is_active BIT DEFAULT 1, -- Soft Delete
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

CREATE TABLE lessons (
    id INT IDENTITY(1,1) PRIMARY KEY,
    course_id INT,
    title NVARCHAR(255), -- Hỗ trợ tiếng Việt
    order_number INT, -- Khắc phục thứ tự bài học (Lesson Ordering)
    video_url VARCHAR(255),
    content NVARCHAR(MAX), -- Khắc phục lỗi dùng TEXT
    is_active BIT DEFAULT 1, -- Soft Delete

    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE cart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    cart_id INT,
    course_id INT,
    -- Đã loại bỏ cột 'quantity' vì mua khóa học online không mua 2 lần

    FOREIGN KEY (cart_id) REFERENCES cart(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (cart_id, course_id) -- Ràng buộc logic giỏ hàng (Cart logic)
);

CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10,2),
    payment_method VARCHAR(50),  -- Bổ sung phương thức thanh toán
    transaction_id VARCHAR(100), -- Bổ sung thông tin giao dịch (Transaction Integrity)
    paid_at DATETIME,            -- Thời gian thanh toán thành công
    status VARCHAR(20) CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT,
    course_id INT,
    price DECIMAL(10,2),

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    course_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX), -- Hỗ trợ bình luận tiếng Việt
    created_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE enrollments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    course_id INT,
    enrolled_at DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- BỔ SUNG: Bảng theo dõi tiến trình học tập
CREATE TABLE user_progress (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    lesson_id INT,
    status VARCHAR(20) CHECK (status IN ('learning', 'completed')) DEFAULT 'learning',
    last_accessed DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- BỔ SUNG: Đánh chỉ mục (Indexing) để cải thiện tốc độ khi tra cứu
CREATE INDEX IX_Courses_Instructor ON courses(instructor_id);
CREATE INDEX IX_Courses_Category ON courses(category_id);
CREATE INDEX IX_Lessons_Course ON lessons(course_id);
CREATE INDEX IX_CartItems_Cart ON cart_items(cart_id);
CREATE INDEX IX_OrderItems_Order ON order_items(order_id);
CREATE INDEX IX_Enrollments_User ON enrollments(user_id);
CREATE INDEX IX_Enrollments_Course ON enrollments(course_id);
CREATE INDEX IX_UserProgress_User ON user_progress(user_id);