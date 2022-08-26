import { ConnectButton } from "@web3uikit/web3";

export default function Header() {
    return (
        <div>
            Decentralized Lottery
            <ConnectButton moralisAuth={false} />
        </div>
    );
}
