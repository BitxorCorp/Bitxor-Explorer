import config from '../config/network.conf.json'

describe('Bitxor Explorer Token Detail page', () => {
    beforeEach(() => {
        cy.visit(`/tokens/${config.testToken.tokenId}`)
    })

    describe('Token Detail Card should', () => {
        it('load title', () => {
            cy.get('[data-cy="tokenDetailTitle"]').should('contain', 'Token Detail')
        })

        it('render table in card', ()=> {
            cy.renderTableInCard("tokenDetailTitle")
        })

        it('render correct table fields.', () => {
            const items = ['Token ID', 'Alias Namespace', 'Divisibility', 'Address', 'Supply', 'Revision', 'Height', 'Duration', 'Supply Mutable', 'Transferable', 'Restrictable']
            cy.renderFieldInTable("tokenDetailTitle", items)
        })
    })

    // Todo: Metadata Entries
    // Todo: Token Restriction
    // Todo: Token Restriction List
  })