import '@testing-library/cypress/add-commands';

describe('Successful Upload - Drag and Drop Method', () => {
  it('Should be able to upload a sheet via drag and drop', () => {

    //Arrange: Visits localhost:3000 (Step 1: Once logged in, visit the home page)
    cy.visit('localhost:3000')
    cy.get('[data-cy="email-input"]').type('admin@admin.com')
    cy.get('[data-cy="password-input"]').type('sheetable') 
    cy.get(':nth-child(4) > input').click()
    cy.get(':nth-child(5) > .cursor > .bx').click()

    cy.get('[name="sheetName"]').type('Sonata in C');
    cy.get('[name="composer"]').type('Mozart');
    cy.get('.upload-container').within(() =>{
      cy.get('[name="files"]').selectFile('Sonata_In_C.pdf', {force: true});
    });
    cy.get('.MuiButtonBase-root').click();

    cy.get(':nth-child(1) > .box-container > .sheet-name-container > .sheet-name').contains('Sonata in C', {matchCase: true})
    cy.get(':nth-child(1) > .box-container > .sheet-composer-container > .sheet-composer').contains('Mozart', {matchCase: true})
  })
})