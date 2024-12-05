SELECT 
    employees.id AS employee_id,
    employees.first_name,
    employees.last_name,
    employees.role_id,
    employees.manager_id,
    roles.id AS role_id,
    roles.title,
    roles.salary,
    departments.id AS department_id,
    departments.name AS department_name
FROM 
    employees
INNER JOIN 
    roles ON employees.role_id = roles.id
INNER JOIN 
    departments ON roles.department_id = departments.id;