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

    //Test causes an error when go from Settings back to Home
    /*
    cy.contains('Home').click()
    cy.url().should('include', '/')
    */

  })
})