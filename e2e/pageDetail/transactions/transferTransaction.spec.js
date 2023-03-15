import config from '../../config/network.conf.json'
import datafiled from '../../config/datafiled.json'

describe('Bitxor Explorer Transaction detail page for Transfer Transaction', () => {
    beforeEach(() => {
        cy.visit(`/transactions/${config.testTransactions.transferTransaction}`)
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
            const items = ['Type', 'Recipient', 'Message']
            cy.renderFieldInTable("transactionDetailTitle", items)
        })
    })

    describe('Tokens card should', () => {
        it('load title', () => {
            cy.get('[data-cy="tokensTitle"]').should('contain', 'Tokens')
        })

        it('render data list in table', () => {
            cy.renderTableInCard('tokensTitle')
        })

        it('render correct table header.', () => {
            const items = ['Token ID', 'Amount', 'Alias Namespace']
            cy.renderHeaderInTable('tokensTitle', items)
        })
    })

})