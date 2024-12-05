import inquirer from "inquirer";
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
//different table print package
import { printTable } from 'console-table-printer';


await connectToDb();

//display art before starting
art();

//main function to navigate through the application
function startup(): void{
    
  inquirer.prompt({
    type: 'list',
    name: 'startup',
    message: 'What would you like to do?',
    choices: ['View all employees', 'View all roles', 'View all departments', 'Add employee', 'Add role', 'Add department', 'Update employee role',  'Exit']
  })
  .then(function(answers){
    if (answers.startup === 'Add employee'){
        console.log('Add employee selected');
        addEmployee();
    } 
    else if (answers.startup === 'Add role'){
        console.log('Add role selected');
        addRole();
    } 
    else if (answers.startup === 'Add department'){
        console.log('Add department selected');
        addDepartment();
    }
    else if (answers.startup === 'Update employee role'){
        console.log('Update employee role selected');
        updateEmployee();
    } 
    else if (answers.startup === 'View all employees'){
        console.log('View all employees selected');
        viewEmployees();
    }
    else if (answers.startup === 'View all roles'){
        console.log('View all roles selected');
        viewRoles();
    }
    else if (answers.startup === 'View all departments'){
        console.log('View all departments selected');
        viewDepartments();
    }
    else if (answers.startup === 'Exit'){
        console.log('Exit selected');
        exit();
    }
  })
};

//initial function call
startup();

// Refactored addEmployee function
async function addEmployee(): Promise<void>{

    //fetch table arrays before adding
    const employeeArray = await fetchEmployees();
    const departmentArray = await fetchDepartments();
    const roleArray = await fetchRoles();
    const managerArray = await fetchManagers();
    // wouldn't display manager name without this
    const managerNameArray = managerArray.map((manager: { value: number; first_name: string; last_name: string; }) => ({
        value: manager.value,
        name: `${manager.first_name} ${manager.last_name}`}));

    //display current employees for user reference
    console.log('Here is a list of current employees for reference:');
    //change employee to show only display first and last name
    const employeeNameArray = employeeArray.map((employee: { value: number; first_name: string; last_name: string; }) => `${employee.first_name} ${employee.last_name}`);
    console.log(employeeNameArray);

    // user input
    inquirer.prompt([
        { 
            type: 'input', 
            name: 'firstName', 
            message: 'What is the employee\'s first name?' 
        }, {
            type: 'input',
            name: 'lastName',
            message: 'What is the employee\'s last name?'
        }, {
            type: 'list',
            name: 'department',
            message: 'What is the employee\'s department?',
            choices: departmentArray
        }, {
            type: 'list',
            name: 'role',
            message: 'What is the employee\'s role?',
            choices: roleArray
        }, {
            type: 'list',
            name: 'manager',
            message: 'Who is the employee\'s manager?',
            choices: managerNameArray //wanted to display manager name instead of id
        }])
        //handle user input and store in database
        .then((answers) => {
            
            // select statement to get employee table
            const sql = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *';
            const params = [answers.firstName, answers.lastName, answers.role, answers.manager];
            //result??
            pool.query(sql, params, (err: Error, result: QueryResult) => {
                if (err) {
                    console.log(err);
                    return;
                } 
                else if (result) {
                printTable(result.rows); //=?
                //fancy way of confirming the selection back to the user
                const role = roleArray.filter((role: { value: number; }) => role.value === answers.role)[0];
                const manager = managerArray.filter((manager: { value: number; }) => manager.value === answers.manager)[0];
                console.log(`${answers.firstName} ${answers.lastName} added with role ${role.name} and manager ${manager.first_name} ${manager.last_name}`);
                startup();
                }
            })
        })
}

async function addRole(): Promise<void>{

    //fetch current roles, departments before adding
    const roleArray = await fetchRoles();
    const departmentArray = await fetchDepartments();
    // user display
    console.log('Here is a list of current roles for reference:');
    const roleNameArray = roleArray.map((role: { value: number; name: string; }) => role.name);
    console.log(roleNameArray);    

    // user input for new role
    inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'What department does this role belong to?',
                choices: departmentArray
            },
            {
                type: 'input',
                name: 'newRole',
                message: 'What is the name of the role you would like to add?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role you would like to add?'
            }])
        .then((answers) => {
            // console.log(`addRole selected`);
            const sql = 'INSERT INTO roles (department_id, title, salary)  VALUES ($1, $2, $3) RETURNING *';
            const params = [answers.department, answers.newRole, answers.salary];

            pool.query(sql, params, (err: Error, result: QueryResult) => {
                if (err) {
                    console.log(err);
                    return;
                } else {
                console.log(`${answers.newRole}added with a salary of ${answers.salary}`);
                printTable(result.rows);
                startup();
                }
            })
        })
}

async function addDepartment(): Promise<void>{

    //fetch and display current departments before adding
    const departmentArray = await fetchDepartments();
    const departmentNameArray = departmentArray.map((department: { value: number; name: string; }) => department.name);
    console.log('Here is a list of current departments for reference:');
    console.log(departmentNameArray);

    inquirer.prompt({
        type: 'input',
        name: 'newDepartment',
        message: 'What is the name of the department you would like to add?'
    })
    .then((answers) => {
        // console.log(`addDepartment selected`);
        const sql = 'INSERT INTO departments (name) VALUES ($1) RETURNING *';
        const params = [answers.newDepartment];

        pool.query(sql, params, (err: Error, result: QueryResult) => {
            if (err){
                console.log(err);
                return;
            } else {
            console.log(`${answers.newDepartment} added`);
            printTable(result.rows);
            startup();
            }
        })
    })
}

async function updateEmployee(): Promise<void> {
    //fetch current employees and roles before updating
    const employeeArray = await fetchEmployees();
    //change employee to show only display first and last name
    const employeeNameArray = employeeArray.map((employee: { value: number; first_name: string; last_name: string; }) => `${employee.first_name} ${employee.last_name}`);

    const roleArray = await fetchRoles();

    inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: 'What employee would you like to update?',
            choices: employeeNameArray
        },
        {
            type: 'list',
            name: 'newRole',
            message: 'What is the new role ID? ', 
            choices: roleArray
        },
    ])
    .then((answers) => {
        // console.log(`updateEmployee selected`);
        const sql = 'UPDATE employees SET role_id = $1 WHERE id = $2 RETURNING *';
        const params = [answers.newRole, answers.employeeId];
        

        pool.query(sql, params, (err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
                return;
            } else {
                //fancy way of confirming the selection back to the user
                // needed if statement because there is a chance they are reassigned the same role
            const updatedRole = roleArray.find((role) => role.value === answers.newRole);
            if (updatedRole) {
              console.log(`${answers.employee} updated to ${updatedRole.name}`);
            } else {
              console.log(`${answers.employee} updated.`);
            }
            console.log(result.rows); // currently prints empty bracket - bc "update" doesn't return anything
            // printTable(result.rows); couldn't get this to work - but have confirmation message already
            startup();
            }
        })
    })
}

//main function to display employees
function viewEmployees(): void {

    console.log('viewEmployees selected');
    const sql = 'SELECT * FROM employees';
    
    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
            return;
        } else {
        printTable(result.rows);
        startup();
        }
    })
}

//main function to display roles
function viewRoles(): void {
    console.log('viewRoles selected');
    const sql = 'SELECT * FROM roles';

    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
            return;
        } else {
        printTable(result.rows);
        startup();
        }
    })
}

//main function to display departments
function viewDepartments(): void {
    console.log('viewDepartments selected');
    const sql = 'SELECT * FROM departments';
    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
            return;
        } else {
        printTable(result.rows);
        startup();
        }
    })
}

//exit application
function exit(): void {
    console.log('Thanks for using the employee tracker!');
    pool.end();
    process.exit(); // Add this line to exit the terminal
}

// ------------ refactored fetch functions for resuability -----------------
// Function to fetch employees and return an array with the same structure as other fetch functions
async function fetchEmployees(): Promise<{ value: number; first_name: string; last_name: string; role_id: number; manager_id: number; }[]> {
    const fetchEmployees = await pool.query('SELECT * FROM employees');
    const employees = fetchEmployees.rows;
    const employeeArray = employees.map((employee: { id: number; first_name: string; last_name: string; role_id: number; manager_id: number; }) => ({
        value: employee.id, //change id to value for inquirer
        first_name: employee.first_name,
        last_name: employee.last_name,
        role_id: employee.role_id,
        manager_id: employee.manager_id
    }));
    return employeeArray;
}

// Function to fetch departments
async function fetchDepartments(): Promise<{ value: number; name: string; }[]> {
    const fetchDepartments = await pool.query('SELECT * FROM departments');
    const departments = fetchDepartments.rows;
    const departmentArray = departments.map((department: { id: number; name: string; }) => ({ value: department.id, name: department.name })); //change id to value for inquirer
    return departmentArray;
}

// Function to fetch roles
async function fetchRoles(): Promise<{ value: number; name: string; }[]> {
    const fetchRoles = await pool.query('SELECT * FROM roles');
    const roles = fetchRoles.rows;
    const roleArray = roles.map((role: { id: number; title: string; }) => ({ value: role.id, name: role.title })); //change id to value for inquirer
    return roleArray;
}

// Function to fetch managers
async function fetchManagers(): Promise<{ value: number; first_name: string; last_name:string }[]> {
    const fetchManagers = await pool.query('SELECT * FROM employees');
    const managers = fetchManagers.rows;
    const managerArray = managers.map((manager: { id: number; first_name: string; last_name: string; }) => ({ 
        value: manager.id, 
        first_name: manager.first_name,
        last_name: manager.last_name
    })); //change id to value for inquirer
    return managerArray;
}

function art(): void {
    //needed to use double backslashes "\\" for every single "\" to escape the original functionality
    console.log(' ________  __       __  _______   __        ______  __      __  ________  ________       ');
    console.log('|        \\|  \\     /  \\|       \\ |  \\      /      \\|  \\    /  \\|        \\|        \\      ');
    console.log('| $$$$$$$$| $$\\   /  $$| $$$$$$$\\| $$     |  $$$$$$\\\\$$\\  /  $$| $$$$$$$$| $$$$$$$$      ');
    console.log('| $$__    | $$$\\ /  $$$| $$__/ $$| $$     | $$  | $$ \\$$\\/  $$ | $$__    | $$__          ');
    console.log('| $$  \\   | $$$$\\  $$$$| $$    $$| $$     | $$  | $$  \\$$  $$  | $$  \\   | $$  \\         ');
    console.log('| $$$$$   | $$\\$$ $$ $$| $$$$$$$ | $$     | $$  | $$   \\$$$$   | $$$$$   | $$$$$         ');
    console.log('| $$_____ | $$ \\$$$| $$| $$      | $$_____| $$__/ $$   | $$    | $$_____ | $$_____       ');
    console.log('| $$     \\| $$  \\$ | $$| $$      | $$     \\\\$$    $$   | $$    | $$     \\| $$     \\      ');
    console.log(' \\$$$$$$$$ \\$$      \\$$ \\$$       \\$$$$$$$$ \\$$$$$$     \\$$     \\$$$$$$$$ \\$$$$$$$$      ');
    console.log('\n');
    console.log(' __       __   ______   __    __   ______    ______   ________  _______                  ');
    console.log('|  \\     /  \\ /      \\ |  \\  |  \\ /      \\  /      \\ |        \\|       \\                 ');
    console.log('| $$\\   /  $$|  $$$$$$\\| $$\\ | $$|  $$$$$$\\|  $$$$$$\\| $$$$$$$$| $$$$$$$\\                ');
    console.log('| $$$\\ /  $$$| $$__| $$| $$$\\| $$| $$__| $$| $$ __\\$$| $$__    | $$__| $$                ');
    console.log('| $$$$\\  $$$$| $$    $$| $$$$\\ $$| $$    $$| $$|    \\| $$  \\   | $$    $$                ');
    console.log('| $$\\$$ $$ $$| $$$$$$$$| $$\\$$ $$| $$$$$$$$| $$ \\$$$$| $$$$$   | $$$$$$$\\                ');
    console.log('| $$ \\$$$| $$| $$  | $$| $$ \\$$$$| $$  | $$| $$__| $$| $$_____ | $$  | $$                ');
    console.log('| $$  \\$ | $$| $$  | $$| $$  \\$$$| $$  | $$ \\$$    $$| $$     \\| $$  | $$                ');
    console.log(' \\$$      \\$$ \\$$   \\$$ \\$$   \\$$ \\$$   \\$$  \\$$$$$$  \\$$$$$$$$ \\$$   \\$$                ');
    console.log('\n');
    console.log('\n');
    console.log('\n');
    
}