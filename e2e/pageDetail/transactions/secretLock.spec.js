import config from '../../config/network.conf.json'
import datafiled from '../../config/datafiled.json'

describe('Bitxor Explorer Transaction detail page for Secret Lock.', () => {
    beforeEach(() => {
        cy.visit(`/transactions/${config.testTransactions.secretLock}`)
    })

    describe('Transaction info card should', () => {
        it('load title', () => {
            cy.get('[data-cy="transactionInfoTitle"]').should('contain', 'Transaction Info')
        })

        it('render data info in table', ()=> {
            cy.renderTableInCard("transactionInfoTitle")
        })

        it('render correct transaction info titles', ()=> {
            const items = datafiled.transactionInfoFields
            cy.renderFieldInTable("transactionInfoTitle", items)
        })
    })

    describe('Transaction Detail card should', () => {
        it('load title', () => {
            cy.get('[data-cy="transactionDetailTitle"]').should('contain', 'Transaction Detail')
        })

        it('render data info in table', ()=> {
            cy.renderTableInCard("transactionDetailTitle")
        })

        it('render correct transaction detail titles', () => {
            const items = ['Transaction Type', 'Duration', 'Token ID', 'Secret', 'Recipient', 'Hash Algorithm']
            cy.renderFieldInTable("transactionDetailTitle", items)
        })
    })
})