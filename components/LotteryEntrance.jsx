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

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
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
            updateUI();
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
            <h1 className="text-xl my-2">Hi from Lottery Entrance!</h1>
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 rounded p-2 my-2"
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (e) => console.error(e),
                            });
                        }}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div className="my-2">
                        Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                    </div>
                    <div className="my-2">Number of Players: {numPlayer}</div>
                    <div className="my-2">Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Deteched</div>
            )}
        </div>
    );
}
