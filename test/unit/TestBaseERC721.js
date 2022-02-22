const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getGasUsedForLastTx } = require("../utils");

describe("Test base ERC721", function () {
    const metadataURI = "cid/test.png";
    const addrNull = "0x0000000000000000000000000000000000000000";

    const DECIMALS = '18'
    const INITIAL_PRICE = '200000000000000000000'

    let myBaseERC721;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async () => {
        const MyMockV3Aggregator = await ethers.getContractFactory("MyMockV3Aggregator");
        myMockV3Aggregator = await MyMockV3Aggregator.deploy(DECIMALS, INITIAL_PRICE,);
        await myMockV3Aggregator.deployed();


        const BaseERC721 = await ethers.getContractFactory("BaseERC721");
        myBaseERC721 = await BaseERC721.deploy("My base ERC721", "Base ERC721", myMockV3Aggregator.address);
        await myBaseERC721.deployed();

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    });

    it('TEST getLatestPrice() - PASS', async () => {
        let result = await myBaseERC721.getLatestPrice();
        // console.log('price:' + new ethers.BigNumber.from(result._hex).toString())
        expect((new ethers.BigNumber.from(result._hex).toString())).equals(INITIAL_PRICE).toString()
    });

    it("TEST payToMint() - PASS", async () => {
        let balance = await myBaseERC721.connect(addr1).balanceOf(addr1.address);
        expect(balance).to.equal(0);

        const newlyMintedToken = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await newlyMintedToken.wait();

        balance = await myBaseERC721.connect(addr1).balanceOf(addr1.address);
        expect(balance).to.equal(1);

        const nft_owner = await myBaseERC721.connect(addr1).ownerOf(0);
        expect(nft_owner).to.equal(addr1.address);

        const currentCounter = await myBaseERC721.connect(addr1).count();
        expect(currentCounter).to.equal(1);
    });

    it("TEST safeMint() for owner - PASS", async () => {
        let balance = await myBaseERC721.connect(owner).balanceOf(owner.address);
        expect(balance).to.equal(0);

        const newlyMintedToken = await myBaseERC721.connect(owner).safeMint(
            owner.address,
            metadataURI
        );
        await newlyMintedToken.wait();

        balance = await myBaseERC721.connect(owner).balanceOf(owner.address);
        expect(balance).to.equal(1);

        const nft_owner = await myBaseERC721.connect(owner).ownerOf(0);
        expect(nft_owner).to.equal(owner.address);

        const currentCounter = await myBaseERC721.connect(owner).count();
        expect(currentCounter).to.equal(1);
    });

    it("TEST safeMint() for not owner - FAIL", async () => {
        let balance = await myBaseERC721.connect(addr2).balanceOf(addr2.address);
        expect(balance).to.equal(0);

        await expect(
            myBaseERC721.connect(addr2).safeMint(addr2.address, metadataURI)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        balance = await myBaseERC721.connect(addr2).balanceOf(addr2.address);
        expect(balance).to.equal(0);

        const currentCounter = await myBaseERC721.connect(addr2).count();
        expect(currentCounter).to.equal(0);
    });

    it("TEST startSale() - PASS", async () => {
        const sellPrice = ethers.utils.parseEther("0.5");
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(sellPrice);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(myBaseERC721.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addr1.address);
    });

    it("TEST startSale() not onwer of token - FAIL", async () => {
        const sellPrice = ethers.utils.parseEther("0.5");
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        await expect(
            myBaseERC721.connect(addr2).startSale(tokenId, sellPrice)
        ).to.be.revertedWith("Cant perform this action, you must be owner of this token!");

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(0);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
    });

    it("TEST startSale() for 0 ETH - FAIL", async () => {
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        await expect(
            myBaseERC721.connect(addr1).startSale(tokenId, 0)
        ).to.be.revertedWith("Can not sale for 0 ETH!");

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(0);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
    });

    it("TEST cancelSale() - PASS", async () => {
        const sellPrice = ethers.utils.parseEther("0.5");
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        const cancelTheSaleTX = await myBaseERC721.connect(addr1).cancelSale(
            tokenId,
        );
        await cancelTheSaleTX.wait();

        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(0);
    });

    it("TEST cancelSale() not onwer of token - FAIL", async () => {
        const sellPrice = ethers.utils.parseEther("0.5");
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        await expect(
            myBaseERC721.connect(addr2).cancelSale(tokenId)
        ).to.be.revertedWith("Cant perform this action, you must be owner of this token!");

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(sellPrice);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(myBaseERC721.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addr1.address);
    });

    it("TEST cancelSale() sale not started - FAIL", async () => {
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        await expect(
            myBaseERC721.connect(addr1).cancelSale(tokenId)
        ).to.be.revertedWith("Cant perform this action, token is not on sale!");

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(0);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
    });

    it("TEST buyTokenOnSale() - PASS", async () => {
        const sellPrice = ethers.utils.parseEther("0.5");
        const tokenId = 0;
        const mintTx = await myBaseERC721.connect(addr1).payToMint(
            addr1.address,
            metadataURI,
            {
                value: ethers.utils.parseEther("0.05"),
            }
        );
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        const addr1BalanceBefor = await addr1.getBalance();
        const addr2BalanceBefor = await addr2.getBalance();
        await myBaseERC721.connect(addr2).buyTokenOnSale(tokenId, { value: sellPrice });

        const gasUsed = await getGasUsedForLastTx();

        expect(await myBaseERC721.connect(addr2).ownerOf(tokenId)).to.equal(addr2.address);
        expect(await myBaseERC721.connect(addr2).tokenIdToPriceOnSale(tokenId)).to.equal(0);
        expect(await myBaseERC721.connect(addr2).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
        expect(await addr1.getBalance()).to.equal(BigInt(addr1BalanceBefor) + BigInt(sellPrice));
        expect(await addr2.getBalance()).to.equal(BigInt(addr2BalanceBefor) - BigInt(sellPrice) - gasUsed);
    });

    it('TEST buyTokenOnSale() token not for sale - FAIL', async () => {
        const sellPrice = ethers.utils.parseEther('0.5');
        const tokenId = 0;
        const mintTx = await myBaseERC721
            .connect(addr1)
            .payToMint(addr1.address, metadataURI, {
                value: ethers.utils.parseEther('0.05'),
            });
        await mintTx.wait();

        const addr1BalanceBefor = await addr1.getBalance();
        const addr2BalanceBefor = await addr2.getBalance();

        await expect(
            myBaseERC721.connect(addr2).buyTokenOnSale(tokenId, { value: sellPrice })
        ).to.be.revertedWith("Cant perform this action, token is not on sale!");

        const gasForRevertedTx = await getGasUsedForLastTx();

        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(addr1.address);
        expect(await addr1.getBalance()).to.equal(addr1BalanceBefor);
        expect(await addr2.getBalance()).to.equal(BigInt(addr2BalanceBefor) - gasForRevertedTx);
    });

    it('TEST buyTokenOnSale() send eth to low - FAIL', async () => {
        const sellPrice = ethers.utils.parseEther('0.5');
        const sendEthAmount = ethers.utils.parseEther('0.05');
        const tokenId = 0;
        const mintTx = await myBaseERC721
            .connect(addr1)
            .payToMint(addr1.address, metadataURI, {
                value: sendEthAmount,
            });
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        const addr1BalanceBefor = await addr1.getBalance();
        const addr2BalanceBefor = await addr2.getBalance();

        await expect(
            myBaseERC721.connect(addr2).buyTokenOnSale(tokenId, { value: sendEthAmount })
        ).to.be.revertedWith("Pleas provide minimum price of this specific token!");

        const gasForRevertedTx = await getGasUsedForLastTx();

        expect(await myBaseERC721.connect(myBaseERC721.address).tokenIdToPriceOnSale(tokenId)).to.equal(sellPrice);
        expect(await myBaseERC721.connect(myBaseERC721.address).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(myBaseERC721.address).ownerOf(tokenId)).to.equal(myBaseERC721.address);
        expect(await addr1.getBalance()).to.equal(addr1BalanceBefor);
        expect(await addr2.getBalance()).to.equal(BigInt(addr2BalanceBefor) - gasForRevertedTx);
    });

    it('TEST burn() token not on sale - PASS', async () => {
        const sendEthAmount = ethers.utils.parseEther('0.05');
        const tokenId = 0;
        const mintTx = await myBaseERC721
            .connect(addr1)
            .payToMint(addr1.address, metadataURI, {
                value: sendEthAmount,
            });
        await mintTx.wait();

        expect(await myBaseERC721.ownerOf(tokenId)).to.equal(addr1.address);

        const burnTx = await myBaseERC721.connect(addr1).burn(tokenId);
        await burnTx.wait();

        await expect(myBaseERC721.ownerOf(tokenId))
            .to.be.revertedWith("'ERC721: owner query for nonexistent token");
    });

    it('TEST burn() token on sale - PASS', async () => {
        const sendEthAmount = ethers.utils.parseEther('0.05');
        const sellPrice = ethers.utils.parseEther('0.5');
        const tokenId = 0;
        const mintTx = await myBaseERC721
            .connect(addr1)
            .payToMint(addr1.address, metadataURI, {
                value: sendEthAmount,
            });
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        expect(await myBaseERC721.ownerOf(tokenId)).to.equal(myBaseERC721.address);

        const burnTx = await myBaseERC721.connect(addr1).burn(tokenId);
        await burnTx.wait();

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(0);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addrNull);
        await expect(myBaseERC721.connect(addr1).ownerOf(tokenId))
            .to.be.revertedWith("'ERC721: owner query for nonexistent token");
    });

    it('TEST burn() not owner of token - FAIL', async () => {
        const sendEthAmount = ethers.utils.parseEther('0.05');
        const sellPrice = ethers.utils.parseEther('0.5');
        const tokenId = 0;
        const mintTx = await myBaseERC721
            .connect(addr1)
            .payToMint(addr1.address, metadataURI, {
                value: sendEthAmount,
            });
        await mintTx.wait();

        const putOnSaleTx = await myBaseERC721.connect(addr1).startSale(
            tokenId,
            sellPrice
        );
        await putOnSaleTx.wait();

        await expect(myBaseERC721.connect(addr2).burn(tokenId))
            .to.be.revertedWith("Cant perform this action, you must be owner of this token!");

        expect(await myBaseERC721.connect(addr1).tokenIdToPriceOnSale(tokenId)).to.equal(sellPrice);
        expect(await myBaseERC721.connect(addr1).tokenIdToOwnerAddressOnSale(tokenId)).to.equal(addr1.address);
        expect(await myBaseERC721.connect(addr1).ownerOf(tokenId)).to.equal(myBaseERC721.address);
    });
});