// import { ConnectButton } from "@web3uikit/web3";

// export default function Header() {
//     return (
//         <div className="p-2 border-b-2 flex flex-row">
//             Decentralized Lottery
//             <ConnectButton moralisAuth={false} />
//         </div>
//     );
// }i

import { ConnectButton } from "@web3uikit/web3";

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl"> Decentralized Lottery</h1>
            <div className="ml-auto py-2 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
