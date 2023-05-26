describe('Successful Login', () => {
  it('types correct Username and Password and log in successfully', () => {

    //Arrange: Visits localhost:3000 (Step 1: Visit the login page)
    cy.visit('localhost:3000')

    //Checks and makes sure login page includes '/login'
    cy.url().should('include', '/login')

    //Checks and makes sure there exists the black Login section title
    cy.get('.title').contains('Login')

    //Act: Checks if there exists a text box called Email Address
    cy.get('.field').contains('Email Address')
    cy.get(':nth-child(1) > input').type('admin@admin.com')

    //Assert
    cy.get(':nth-child(1) > input').should('have.value', 'admin@admin.com')

    //Act: Checks if there exists a text box called Password
    cy.get('.field').contains('Password')
    cy.get(':nth-child(2) > input').type('sheetable') //checks if can type in input
    
    //Assert
    cy.get(':nth-child(2) > input').should('have.value', 'sheetable')

    //Act: Check if can click Login button
    cy.contains('Login')
    cy.get(':nth-child(4) > input').click()

  })
})


describe('Successful Login - Home Page hamburger menu test', () => {
  it('Should be able to click on recently added sheets', () => {

    //Arrange: Visits localhost:3000 (Step 1: Once logged in, visit the home page)
    cy.visit('localhost:3000')
    cy.get(':nth-child(1) > input').type('admin@admin.com')
    cy.get(':nth-child(2) > input').type('sheetable')
    cy.get(':nth-child(4) > input').click()

    
    //Act: 
    cy.contains('Upload')
    cy.contains('Synchronize')

    cy.contains('Sheets').click()
    cy.url().should('include', '/sheets')

    cy.contains('Search').click()
    cy.url().should('include', '/search')

    cy.contains('Settings').click()
    cy.url().should('include', '/settings')

    cy.contains('Home').click()
    cy.url().should('include', '/')


  })
})

//Automation test for Forget password in dev fails when sending email.
/*
describe('Forgot Login', () => {
  it('User cannot remember password', () => {

    //Visits localhost:3000 (Step 1: Visit the login page)
    cy.visit('localhost:3000/login')

    //Checks and makes sure login page includes '/login'
    cy.url().should('include', '/login')

    //Checks if there exists a text box called Email Address
    cy.get('a').contains('Forgot password?')
    cy.get('a').click()
    cy.url().should('include', '/forgot-password')

    cy.get('#standard-basic').type('admin@admin.com')

    cy.get('.MuiButtonBase-root').contains('Send Email').click()

  })
  
})
*/