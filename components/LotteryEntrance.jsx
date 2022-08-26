import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddress } from "../constants";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const dispatch = useNotification();

    const [entranceFee, setEntranceFee] = useState("0");
    const [numPlayer, setNumPlayer] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in contractAddress ? contractAddress[chainId][0] : null;

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const updateUI = async () => {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        const numPlayerFromCall = (await getNumberOfPlayers()).toString();
        const recentWinnerFromCall = await getRecentWinner();
        setEntranceFee(entranceFeeFromCall);
        setNumPlayer(numPlayerFromCall);
        setRecentWinner(recentWinnerFromCall);
    };

    const handleSuccess = async (tx) => {
        await tx.wait(1);
        handleNewNotification();
    };

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            position: "topR",
            icon: "bell",
            message: "Transaction Complete!",
            title: "Tx Notification",
        });
    };

    const enterEvent = {
        address: raffleAddress,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            ethers.utils.id("RaffleEnter(address)"),
        ],
    };

    const winnerPickedEvent = {
        address: raffleAddress,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            ethers.utils.id("WinnerPicked(address)"),
        ],
    };

    useEffect(() => {
        if (isWeb3Enabled) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            provider.on(enterEvent, async () => {
                updateUI();
            });
            provider.on(winnerPickedEvent, async () => {
                updateUI();
            });
        }
    }, [isWeb3Enabled]);

    return (
        <div>
            Hi from Lottery Entrance!
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (e) => console.error(e),
                            });
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>Number of Players: {numPlayer}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>Please connect to a support chain</div>
            )}
        </div>
    );
}
