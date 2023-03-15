describe('Bitxor Explorer Footer should', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('link to correct bitxor.io given click on Bitxor News', () => {
        cy.get('.footer').contains('Bitxor News')
        .click()
        .should('have.attr', 'href')
        .and('include', 'bitxor.io')
    })

    it('link to correct forum.bitxor.org given click on Forum', () => {
        cy.get('.footer')
        .contains('Forum')
        .click()
        .should('have.attr', 'href')
        .and('include', 'forum.bitxor.org')
    })

    it('link to correct bitxorcorp github given click on Github', () => {
        cy.get('.footer')
        .contains('Github')
        .click()
        .should('have.attr', 'href')
        .and('include', 'github.com/bitxorcorp')
    })

    it('link to correct bitxor telegram given click on Telegram', () => {
        cy.get('.footer')
        .contains('Telegram')
        .click()
        .should('have.attr', 'href')
        .and('include', 't.me/bitxor')
    })

    it('link to correct /r/bitxor/ reddit given click on Reddit', () => {
        cy.get('.footer')
        .contains('Reddit')
        .click()
        .should('have.attr', 'href')
        .and('include', 'reddit.com/r/bitxor')
    })

    it('link to correct terms page given click on Terms', () => {
        cy.get('.footer')
        .contains('Terms')
        .click()

        cy.url()
        .should('contain', '/terms')
    })

    it('link to correct privacy page given click on Privacy', () => {
        cy.get('.footer')
        .contains('Privacy')
        .click()

        cy.url()
        .should('contain', '/privacy')
    })

    it('contain Node Selector component', () => {
        cy.get('.node-selector')
    })

})
