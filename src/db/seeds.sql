
INSERT INTO departments (name)
VALUES 
    ('Security'),
    ('Sales'),
    ('Engineering'),
    ('Human Resources'),
    ('Warehouse');

INSERT INTO roles ( department_id, title, salary)
VALUES 
    -- security 
    (1, 'BOSS', 150000),
    (1, 'Security Guard', 75000),
    -- sales 
    (2, 'Intern', 0),
    (2, 'Entry-Level', 50000),
    (2, 'Full-Time', 75000),
    (2, 'Manager', 100000),
    -- engineering
    (3, 'Intern', 0),
    (3, 'Entry-Level', 50000),
    (3, 'Full-Time', 75000),
    (3, 'Manager', 100000),
    -- hr
    (4, 'Secretary', 50000),
    (4, 'Representative', 75000),
    (4, 'Cheif Wellness', 100000),
    -- warehouse
    (5, 'Full-Time', 75000);
    

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
    ('John', 'Snow', 1, NULL),
    ('Sally', 'Seashell', 2, 1),
    ('William', 'Shakespeare', 3, 1),
    ('Itza', 'Memario', 4, NULL),
    ('Charlotte', 'Web', 5, 2),
    ('Ricky', 'Savage', 1, 2),
    ('Lewis', 'Clark', 2, NULL),
    ('Samantha', 'Smith', 3, 3),
    ('George', 'Washington', 5, 3),
    ('Tommy', 'Jefferson', 4, NULL),
    ('Ben', 'Franklin', 2, 4),
    ('Abraham', 'Link', 4, 4);

    