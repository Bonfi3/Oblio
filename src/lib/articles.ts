import { EXPECTED_ADDITIONAL_APY, PROVISIONED_APY } from './apy';

export type Block = { h: string } | { p: string } | { list: string[] } | { note: string };

export interface Article {
  slug: string;
  title: string;
  category: 'Yield' | 'Product' | 'Education';
  date: string; // ISO date
  minutes: number;
  excerpt: string;
  /** Cover image in /public; until set, a hairline placeholder is drawn. */
  image?: string;
  body: Block[];
}

const provisioned = `${PROVISIONED_APY.toFixed(2)}%`;
const additional = `${EXPECTED_ADDITIONAL_APY.toFixed(1)}%`;

// Newest first.
export const ARTICLES: Article[] = [
  {
    slug: 'additional-apy',
    title: `Where the expected additional ${additional} APY comes from`,
    category: 'Yield',
    date: '2026-10-02',
    minutes: 6,
    excerpt: `Provisioned staking pays ${provisioned}. On top of it, Oblio targets an additional ${additional} from block rewards, performance-based delegation and the use of obSOL across Solana DeFi.`,
    body: [
      {
        p: `Every obSOL position earns two layers of yield. The first is the provisioned staking APY of ${provisioned}: protocol rewards paid by the Solana network to the validators Oblio delegates to, net of fees. The second is the expected additional APY of ${additional}, which comes from sources that a basic stake account leaves on the table.`,
      },
      { h: 'Layer one: provisioned staking rewards' },
      {
        p: 'Solana pays inflation rewards to staked SOL at the end of every epoch, roughly every two days. Oblio delegates the pool across a set of validators and the rewards accrue to the pool. They are reflected in the obSOL exchange rate, so the number of tokens you hold stays the same while each one is worth more SOL over time.',
      },
      { h: 'Layer two: the additional yield' },
      { p: 'The additional APY combines three sources, each covered in its own article:' },
      {
        list: [
          'Block rewards. Validators also earn priority fees and MEV tips from the blocks they produce. Oblio delegates to validators that share these rewards and passes them to stakers.',
          'Performance-based delegation. Stake is rebalanced every epoch toward validators with the best measured results, which reduces the rewards lost to downtime, missed votes and commission changes.',
          'Composable obSOL. Because obSOL is a liquid token, it can be supplied to lending markets or liquidity pools while it keeps earning staking rewards.',
        ],
      },
      { h: 'How we arrive at the figure' },
      {
        p: `The ${additional} figure is an estimate built from recent network data: the share of validator revenue coming from priority fees and MEV, the gap between top-performing and average validators, and prevailing rates for SOL liquid staking tokens in established DeFi venues. It moves with network activity and market conditions.`,
      },
      {
        note: `The additional APY is expected, not guaranteed. The provisioned ${provisioned} is the base rate of the pool; DeFi strategies carry their own smart contract and market risks.`,
      },
    ],
  },
  {
    slug: 'block-rewards',
    title: 'Block rewards, returned to stakers',
    category: 'Product',
    date: '2026-09-29',
    minutes: 4,
    excerpt:
      'Validators earn more than inflation: priority fees and MEV tips are a growing share of their revenue. Oblio routes that value back to obSOL holders.',
    body: [
      {
        p: 'A Solana validator has three revenue streams: inflation rewards, priority fees paid by users who want their transactions included faster, and MEV tips paid by searchers for the order of transactions inside a block. On busy days the last two can exceed the first.',
      },
      {
        p: 'Many stake setups only capture inflation rewards. The fees and tips stay with the validator operator. Oblio selects validators that distribute these rewards to their delegators and passes the full amount it receives to the pool.',
      },
      { h: 'How it reaches your position' },
      {
        p: 'Block rewards are collected each epoch together with staking rewards and added to the pool. They raise the obSOL exchange rate. There is nothing to claim and nothing to restake: the rewards compound automatically.',
      },
      {
        p: 'This is the largest single contributor to the expected additional APY, and the most variable: it rises with on-chain activity.',
      },
    ],
  },
  {
    slug: 'performance-delegation',
    title: 'Delegation that follows performance',
    category: 'Product',
    date: '2026-09-24',
    minutes: 5,
    excerpt:
      'Stake is reallocated every epoch toward the validators with the best measured results, so underperformance is not paid for by stakers.',
    body: [
      {
        p: 'The return on staked SOL depends heavily on the validator. A validator that goes offline, misses votes or raises its commission pays less, and a delegator who is not watching keeps accepting the lower rate.',
      },
      { h: 'What we measure' },
      {
        list: [
          'Vote credits earned per epoch, the most direct measure of rewards delivered.',
          'Uptime and skipped slots.',
          'Inflation and MEV commission, including changes between epochs.',
          'Share of block rewards distributed to delegators.',
        ],
      },
      { h: 'How stake moves' },
      {
        p: 'At every epoch boundary the pool is rebalanced. Validators that fall below the performance threshold lose stake; the best performers receive more. Caps on the share of stake any single validator can hold keep the pool diversified and support the decentralization of the network.',
      },
      {
        p: 'For stakers this runs in the background. The result is a steadier yield that does not depend on monitoring a single operator.',
      },
    ],
  },
  {
    slug: 'composable-obsol',
    title: 'obSOL keeps earning while you use it',
    category: 'Product',
    date: '2026-09-18',
    minutes: 4,
    excerpt:
      'obSOL is a liquid token. Hold it, supply it to lending markets or provide liquidity, and staking rewards keep accruing the whole time.',
    body: [
      {
        p: 'Native stake is locked to a stake account. Leaving takes until the end of the epoch and the SOL cannot be used in the meantime. obSOL removes that constraint: it is an SPL token that represents your share of the pool and can move like any other token.',
      },
      { h: 'Ways to put it to work' },
      {
        list: [
          'Hold it. Staking rewards accrue through the exchange rate with no further action.',
          'Lend it. Supply obSOL to a lending market and earn interest on top of staking rewards.',
          'Use it as collateral. Borrow against your position without unstaking.',
          'Provide liquidity. Pair obSOL in a pool and earn trading fees.',
        ],
      },
      {
        p: 'Each of these adds a second return on the same capital. It is the part of the additional APY that depends on how you choose to use your position.',
      },
      {
        note: 'Third-party protocols have their own risks and terms. Oblio does not control them.',
      },
    ],
  },
  {
    slug: 'provisioned-apy',
    title: `What a ${provisioned} provisioned APY means`,
    category: 'Yield',
    date: '2026-09-11',
    minutes: 5,
    excerpt:
      'How the provisioned rate is calculated, why it is quoted net of fees, and why APY displays can move when the network changes speed.',
    body: [
      {
        p: `The provisioned staking APY is the annualized rate the pool earns from Solana protocol rewards, after validator commission and Oblio fees. It is currently ${provisioned}.`,
      },
      { h: 'Measured from the exchange rate' },
      {
        p: 'Rewards are paid per epoch. The rate is derived from the change in the obSOL exchange rate over recent epochs and annualized. Because it is measured from the token itself, it reflects what a holder actually received, not a projection.',
      },
      { h: 'Why displayed APY can move' },
      {
        p: 'Epoch length is defined in slots, not hours. When the network produces blocks faster, epochs get shorter and more of them fit in a year. Annualization formulas that assume a fixed epoch length can then show a different APY even though the rewards per staked SOL have not changed. We annualize using observed epoch durations to keep the figure comparable over time.',
      },
      {
        p: `The provisioned rate is the base. The expected additional ${additional} is reported separately so the two are never blended.`,
      },
    ],
  },
  {
    slug: 'confidential-staking',
    title: 'Confidential staking, explained',
    category: 'Education',
    date: '2026-09-04',
    minutes: 6,
    excerpt:
      'On a public chain, every stake position is visible to anyone. For funds, treasuries and market makers, that visibility is a cost. Oblio keeps positions out of view.',
    body: [
      {
        p: 'Solana stake accounts are public. Anyone can see which wallet staked how much, with which validator and when it moved. For an individual this is a minor concern. For an institution it exposes treasury size, timing and strategy to counterparties and competitors.',
      },
      { h: 'Why it matters' },
      {
        list: [
          'Large stake or unstake movements can be anticipated and traded against.',
          'Balances reveal treasury size and liquidity to counterparties.',
          'Wallet history links positions across protocols and over time.',
        ],
      },
      { h: 'How Oblio approaches it' },
      {
        p: 'Stakers deposit into a pool and receive obSOL. The pool delegates on behalf of all participants, so individual positions are not tied to specific stake accounts. Your rewards and your ability to redeem stay the same; what changes is who can see them.',
      },
      {
        p: 'Confidentiality is built into the product rather than added as an option, so every position benefits from the size of the pool.',
      },
    ],
  },
  {
    slug: 'liquid-vs-native',
    title: 'Liquid staking or native staking: a guide for treasuries',
    category: 'Education',
    date: '2026-08-27',
    minutes: 7,
    excerpt:
      'Native staking locks SOL until the epoch ends and ties you to a validator. Liquid staking trades that for a token you can redeem or use at any time.',
    body: [
      {
        p: 'Both approaches earn Solana staking rewards. They differ in liquidity, operations and the work required to keep returns competitive.',
      },
      { h: 'Native staking' },
      {
        list: [
          'You create stake accounts and choose validators yourself.',
          'Deactivation completes at the end of the epoch, so SOL is unavailable for up to two days.',
          'Performance monitoring and redelegation are your responsibility.',
        ],
      },
      { h: 'Liquid staking with obSOL' },
      {
        list: [
          'One token represents a diversified, actively managed position.',
          'Redeem whenever you need SOL, or use obSOL directly in DeFi.',
          'Rewards compound through the exchange rate, which simplifies accounting.',
          'Positions stay confidential.',
        ],
      },
      { h: 'Choosing' },
      {
        p: 'Native staking suits holders who run their own validator relationships and never need to move quickly. For most treasuries, liquidity and lower operating overhead make liquid staking the more practical default.',
      },
    ],
  },
];

export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

// The three features highlighted on the home page, each backed by an article.
export const FEATURES = [
  { slug: 'block-rewards', title: 'Block rewards, returned', text: 'Priority fees and MEV tips earned by validators flow back to obSOL holders, not just inflation rewards.' },
  { slug: 'performance-delegation', title: 'Performance-based delegation', text: 'Stake is rebalanced every epoch toward the validators with the best measured results.' },
  { slug: 'composable-obsol', title: 'Composable obSOL', text: 'Lend, borrow against or pool obSOL across Solana DeFi while staking rewards keep accruing.' },
] as const;
