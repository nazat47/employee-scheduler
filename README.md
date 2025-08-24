Setup instructions:
- create a .env file on the root directory and add the following variables-
          PORT=3001 
          NODE_ENV=development
          DB_URL="your mongodb uri"
          JWT_SECRET="anysecret"
          ACCESS_TOKEN_EXPIRES_IN=900 
          REFRESH_TOKEN_EXPIRES_DAYS=30
- in the terminal of the root directory, run 'npm install' and then 'npm run dev'
- you are all set!

* The seed file is located inside scripts folder inside the projects src directory. The seed will be executed
  when the server starts up.

Sample request: A POST request on 'http://localhost:3001/api/v1/schedule?date=2025-08-26' will return the daily shift schedule data 
* You need to get authenticated first to use the endpoints. From the seed-data file, it is recommended to use the user with role 'hr'
  to get access to all the endpoints. After logging in, get the access token from response and use it in subsequent requests
  with the header 'Authorization' and its value 'Bearer yourtoken'.

Data Models-
- Employee (firstname, lastname, email, password, role[hr,manager,team-lead,devops,engineer,senior-engineer], skills, location, team, availability[{dayofweek,startTime,endTime}])
- Shift (date,startTime, endTime, rolesRequired, skillsRequired,location,team, status, assignedEmployees)
- Timeoff (employeeId, startDate, endDate, status)

Indexing stragegies:
- On the Shift data model, based on query operations, created composit index on (assignedEmployees, status, date, startTime),
  created another composit index on (date, startTime) and another on (date, location, team) as these where the fields
  which were mostly used for quering data.
- On the Timeoff data model, based on query operations, created composit index on (employee, status, startDate, endDate),
  created another composit index on (employee, startDate) as these where the fields which were mostly used for quering data.

Conflict Rules: Before assigning an employee to a shift, it is checked that, if the employee is available during the shift period,
                or, if there are any existing shifts of the employee that overlaps with the current shift, or,
                if the employee has timeoff during the current shift.
Coverage Logic: First of all, you can get coverage of shifts based on id,date,location or time. To get the coverage,
                first, required roles and assigned roles are taken from the shifts, from those information, the total unique assigned roles
                are taken, then, the missing roles are calculated. Based on those information, coverage percentage is calculated.
                finally the shifts with the coverage data are returned back.
                
