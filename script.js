const wallets = {
  sol: {
    label: "Solana",
    address: "BBX6mCEQhhpC9Ms1b2QhoVyhJDwqoHt76hNYjjnUqGvp",
  },
  ltc: {
    label: "Litecoin",
    address: "LWxMQxaMogAjkKUqY4zSmFLqw6BJ28UxhA",
  },
};

const mainCta = document.querySelector("[data-main-cta]");
const paymentSection = document.querySelector("#payment");
const networkButtons = document.querySelectorAll("[data-network]");
const walletNetwork = document.querySelector("#walletNetwork");
const walletAddress = document.querySelector("#walletAddress");
const copyButton = document.querySelector("[data-copy-address]");
const paymentForm = document.querySelector("[data-payment-form]");
const successState = document.querySelector("[data-success-state]");
const txHash = document.querySelector("#txHash");
const formNote = document.querySelector("[data-form-note]");
const successNetwork = document.querySelector("[data-success-network]");
const successHash = document.querySelector("[data-success-hash]");

let activeNetwork = "sol";

function setNetwork(network) {
  if (!wallets[network]) return;

  activeNetwork = network;
  walletNetwork.textContent = wallets[network].label;
  walletAddress.value = wallets[network].address;

  networkButtons.forEach((button) => {
    const isActive = button.dataset.network === network;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  resetCopyButton();
}

function resetCopyButton() {
  copyButton.textContent = "Скопировать";
  copyButton.classList.remove("is-copied");
}

async function copyAddress() {
  const value = walletAddress.value;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    walletAddress.select();
    document.execCommand("copy");
  }

  copyButton.textContent = "Скопировано";
  copyButton.classList.add("is-copied");
  window.setTimeout(resetCopyButton, 1800);
}

function showSuccess(hash) {
  paymentForm.hidden = true;
  successState.hidden = false;
  successNetwork.textContent = wallets[activeNetwork].label;
  successHash.textContent = hash;
  history.replaceState(null, "", "#success");
}

mainCta.addEventListener("click", () => {
  paymentSection.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => walletAddress.focus(), 520);
});

networkButtons.forEach((button) => {
  button.addEventListener("click", () => setNetwork(button.dataset.network));
});

copyButton.addEventListener("click", copyAddress);

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const hash = txHash.value.trim();

  if (!hash) {
    formNote.textContent = "Добавьте tx hash после перевода.";
    formNote.classList.add("is-error");
    txHash.focus();
    return;
  }

  formNote.classList.remove("is-error");
  showSuccess(hash);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

setNetwork(activeNetwork);
