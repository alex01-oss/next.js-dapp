"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { use, useState } from "react";
import styles from "./page.module.css";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";

const CssTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#E0E3E7",
    },
    "&:hover fieldset": {
      borderColor: "#B2BAC2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
});

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(
    null
  );
  const { enqueueSnackbar } = useSnackbar();

  const detectInfo = async (provider: ethers.providers.Web3Provider) => {
    const { chainId } = await provider.getNetwork();

    try {
      const chains = await (
        await fetch("https://chainid.network/chains.json")
      ).json();
      const chain = chains.find((c: any) => c.chainId === chainId);
      return {
        currency: chain
          ? chain.nativeCurrency.symbol
          : `Unknown Currency (Chain ID: ${chainId})`,
        network: chain ? chain.name : `Unknown Name (Chain ID: ${chainId})`,
      };
    } catch {
      return {
        currency: `Unknown Currency (Chain ID: ${chainId})`,
        network: `Unknown Network (Chain ID: ${chainId})`,
      };
    }
  };

  const connect = async () => {
    try {
      if (!window.ethereum) {
        enqueueSnackbar("metamask not installed", { variant: "error" });
        return;
      }

      const metamaskProvider = new ethers.providers.Web3Provider(
        window.ethereum
      );

      const accounts = await metamaskProvider.send("eth_requestAccounts", []);
      setProvider(metamaskProvider);
      setSigner(metamaskProvider.getSigner());
      setAddress(accounts[0]);

      const info = await detectInfo(metamaskProvider);
      setCurrency(info.currency);
      setNetwork(info.network);

      enqueueSnackbar(`metamask connected (${network})`, {
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("error connecting metamask", { variant: "error" });
    }
  };

  const transaction = async () => {
    if (!signer && !provider) {
      enqueueSnackbar("first connect metamask", { variant: "error" });
      return;
    }

    if (!ethers.utils.isAddress(recipient)) {
      enqueueSnackbar("recipient address is incorrect", { variant: "error" });
      return;
    }

    try {
      if (!amount || isNaN(Number(amount))) {
        enqueueSnackbar("Invalid amount", { variant: "error" });
        return;
      }

      const tx = {
        to: recipient,
        value: ethers.utils.parseUnits(amount),
        gasLimit: ethers.utils.hexlify(100000), // 100 qwei
      };

      const response = await signer?.sendTransaction(tx);
      enqueueSnackbar(`transaction sent, hash: ${response?.hash}`, {
        variant: "success",
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("error transaction: " + e, { variant: "error" });
    }
  };

  return (
    <Container className={styles.container}>
      <Typography className={styles.title} variant="caption" gutterBottom>
        Transaction App
      </Typography>
      <Typography className={styles.subtitle}>
        Your network: {network || "not connected"}
      </Typography>
      <Typography className={styles.subtitle}>
        Your address: {address || "not connected"}
      </Typography>
      <Button
        className={styles.connectButton}
        onClick={connect}
        size="small"
        variant="contained"
        color="inherit"
      >
        Connect MetaMask
      </Button>
      <Divider className={styles.divider} />
      <Box
        component="form"
        autoComplete="off"
        noValidate
        className={styles.formContainer}
      >
        <CssTextField
          variant="outlined"
          size="small"
          fullWidth
          label="Recipient address"
          onChange={(e) => {
            setRecipient(e.target.value);
          }}
        />
        <CssTextField
          variant="outlined"
          size="small"
          fullWidth
          type="number"
          label={`Amount of ${currency}`}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        />
        <Button
          onClick={transaction}
          className={styles.sendButton}
          variant="contained"
          color="primary"
        >
          Send
        </Button>
      </Box>
    </Container>
  );
}
