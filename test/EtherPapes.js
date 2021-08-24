const { parseUnits } = require('ethers/lib/utils')
const { expect } = require('chai')
const { ethers, waffle } = require('hardhat')

const getPrice = id => parseUnits('0.001', 'ether').mul(id ** 2)

describe('EtherPapes Contract', async () => {
  const CID = 'IPFS_CID_HASH'

  let EtherPapes,
      contract,
      owner,
      buyer1,
      buyer2,
      addrs

  beforeEach(async () => {
    EtherPapes = await ethers.getContractFactory('EtherPapes');
    [ owner, jalil, buyer1, buyer2, ...addrs ] = await ethers.getSigners()


    // Deploy the smart contract
    contract = await EtherPapes.deploy(CID, 'https://etherpapes.xyz/contract-meta')
  })

  describe('Deployment', () => {
    it('Should set the total supply of 100 tokens', async () => {
      expect(await contract.totalSupply()).to.equal(100)
    })

    it('Should set the right contract meta data URL', async () => {
      expect(await contract.contractURI()).to.equal('https://etherpapes.xyz/contract-meta')
    })
  })

  describe('Supports Interfaces', () => {
    it('Should support the IERC721 interface', async () => {
      expect(await contract.supportsInterface(0x80ac58cd)).to.be.true
    })

    it('Should support the IERC721Metadata interface', async () => {
      expect(await contract.supportsInterface(0x5b5e139f)).to.be.true
    })
  })

  describe('Claiming Phase', () => {
    describe('Claim', () => {
      it('Wallets should be able to claim a paper', async () => {
        const transaction = await contract.connect(buyer1).claim({ value: getPrice(1) })
        const receipt = await transaction.wait()
        tokenId = receipt.events?.find(e => e.event === 'Transfer').args.tokenId

        expect(await contract.ownerOf(tokenId)).to.equal(buyer1.address)

        // Others can claim too
        await expect(contract.connect(buyer2).claim({ value: getPrice(2) }))
                    .to.emit(contract, 'Transfer')
      })

      it('Updates the sold count', async () => {
        expect(await contract.tokenCount()).to.equal(0)

        await contract.connect(buyer1).claim({ value: getPrice(1) })
        expect(await contract.tokenCount()).to.equal(1)

        await contract.connect(buyer2).claim({ value: getPrice(2) })
        expect(await contract.tokenCount()).to.equal(2)
      })

      it('Sells 100, then fails on further tries', async () => {
        let sold = 0

        console.log(`         Started selling`)
        while (sold < 100) {
          await contract.connect(buyer1).claim({ value: getPrice(sold + 1) })
          sold ++
          if (sold % 10 === 0) {
            console.log(`          === ${sold} SOLD ===`)
            expect(await contract.tokenCount()).to.equal(sold)
          }
        }

        expect(await contract.tokenCount()).to.equal(100)

        await expect(contract.connect(buyer1).claim({ value: getPrice(101) }))
                    .to.be.revertedWith('No more tokens available')
      })
    })
  })


  describe('Token Holder', () => {
    let tokenId

    beforeEach(async () => {
      const transaction = await contract.connect(buyer1).claim({ value: getPrice(1) })
      const receipt = await transaction.wait()

      tokenId = receipt.events?.find(
        e => e.event === 'Transfer'
      ).args.tokenId
    })

    describe('Show Pape', () => {
      it('Should show the Pape of a holder', async () => {
        expect(await contract.ownerOf(tokenId)).to.equal(buyer1.address)
      })

      it('Should not show a Pape for non-holders', async () => {
        const otherTokenId = tokenId === 100 ? tokenId - 1 : tokenId + 1

        await expect(contract.ownerOf(otherTokenId)).to.be.revertedWith('ERC721: owner query for nonexistent token')
        expect(await contract.balanceOf(buyer2.address)).to.equal(0)
      })
    })

    describe('Transfer Pape', () => {
      it('Should be able to transfer a Pape to another wallet', async () => {
        await contract.connect(buyer1).transferFrom(buyer1.address, buyer2.address, tokenId)

        expect(await contract.ownerOf(tokenId)).to.equal(buyer2.address)
      })
    })
  })

  describe('Update Contract Meta Data', () => {
    it('Owner can update the contract meta data URI', async () => {
      await contract.setContractURI('foobar')

      expect(await contract.contractURI()).to.equal('foobar')
    })

    it('Non-Owners can not update the contract meta data URI', async () => {
      await expect(contract.connect(buyer1).setContractURI('foobar'))
        .to.be.revertedWith('caller is not the owner')
    })
  })
})
