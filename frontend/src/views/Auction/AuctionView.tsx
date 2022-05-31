import style from "./auction.module.scss";
import { AuctionItem } from "interfaces/index";
import { GreenETHValue, CreatorsListItem, ProfilePicture, RoundButton, Button } from "components";
import { AiFillHeart } from "react-icons/ai";
import { FiShare, FiMoreHorizontal } from "react-icons/fi";
import { Toast } from "components";

enum ToolsOptions {
    EditAuction = "editAuction",
    RemoveFromSale = "removeFromSale",
    Report = "report",
}

interface ToolsItem {
    action: ToolsOptions;
    icon: JSX.Element;
}
interface AuctionViewProps {
    auctionData: AuctionItem | null;
    ethDolarExchange: (eth: number) => number;
    onLikeButtonClick: () => void;
    onShareButtonClick: () => void;
    onMoreInfoButtonClick: () => void;
    isLiked: boolean;
    toolsArray: ToolsItem[];
    moreOptionsDropDownRef: React.RefObject<HTMLDivElement>;
    toastMessage?: string;
}

export const AuctionView = ({
    auctionData,
    ethDolarExchange,
    onLikeButtonClick,
    onShareButtonClick,
    onMoreInfoButtonClick,
    isLiked,
    toolsArray,
    moreOptionsDropDownRef,
    toastMessage,
}: AuctionViewProps) => {
    const { productID, price, amount, bidHistory } = auctionData || {};
    const { productImageUrl, productName, productDescription } = productID || {};

    const highestBid =
        bidHistory && bidHistory[0] ? bidHistory[bidHistory?.length - 1].bid : undefined;

    return !auctionData ? (
        <div className={style.auctionNotFound}>Auction not found</div>
    ) : (
        <>
            <div className={style.sectionContainer}>
                <img src={productImageUrl} alt="productImage" className={style.productImage} />
                <div className={style.productInfo}>
                    <h3 className={style.productName}>{productName}</h3>
                    <div className={style.priceInfo}>
                        <GreenETHValue ETHValue={auctionData.price} />
                        <p className={style.dolarValue}>
                            ${price ? ethDolarExchange(price) : null}
                        </p>
                        <p className={style.stockValue}>{amount} in stock</p>
                    </div>
                    <div className={style.productDescription}>{productDescription}</div>
                    <div>
                        <h4 className={style.bids}>Bids</h4>
                        {bidHistory?.map((item, index) => (
                            <CreatorsListItem
                                profile={item.bid.profileID}
                                offer={item.bid.offer}
                                key={index}
                            />
                        ))}
                    </div>
                    <div className={style.highestBidContainer}>
                        {highestBid ? (
                            <div className={style.bidInfo}>
                                <ProfilePicture
                                    url={highestBid.profileID.profilePicture}
                                    width="60px"
                                />
                                <div>
                                    <p className={style.highestBid}>
                                        Highest bid by
                                        <span className={style.highestBidName}>
                                            {highestBid.profileID.profileName}
                                        </span>
                                    </p>
                                    <div className={style.cashValues}>
                                        <p className={style.bidEthValue}>
                                            ETH
                                            {highestBid.offer}
                                        </p>
                                        <p className={style.bidDolarValue}>
                                            ${ethDolarExchange(highestBid?.offer)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <Button text="Purchase now" blue={true} />
                        <Button text="Place a bid" blue={false} />
                    </div>
                </div>
                <div className={style.roundButtons}>
                    <RoundButton
                        element={<FiShare fontSize="24px" color="#777e91" />}
                        onClick={onShareButtonClick}
                        tooltip="Link copied to clipboard"
                    />
                    <RoundButton
                        element={
                            isLiked ? (
                                <AiFillHeart fontSize="24px" color="#EF466F" />
                            ) : (
                                <AiFillHeart fontSize="24px" color="#777e91" />
                            )
                        }
                        onClick={onLikeButtonClick}
                    />
                    <RoundButton
                        element={<FiMoreHorizontal fontSize="24px" color="#777e91" />}
                        onClick={onMoreInfoButtonClick}
                    />
                    <div ref={moreOptionsDropDownRef} className={style.moreOptionsDropDown}>
                        {toolsArray.map((item) => (
                            <div key={item.action} className={style.optionContainer}>
                                {item.icon}
                                <p>{item.action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {toastMessage && <Toast message={toastMessage} />}
        </>
    );
};