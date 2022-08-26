import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, account, Moralis, isWeb3EnableLoading, deactivateWeb3 } =
        useMoralis();

    useEffect(() => {
        if (isWeb3Enabled) return;
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3();
            }
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log(`Account changed to ${account}`);
            if (account == null) {
                window.localStorage.removeItem("connected");
                deactivateWeb3();
                console.log("Null account found");
            }
        });
    }, []);

    return (
        <div>
            {isWeb3Enabled ? (
                <div>
                    Connected {account.slice(0, 6)}...{account.slice(account.length - 4)}
                </div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3();
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "inject");
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    );
}
