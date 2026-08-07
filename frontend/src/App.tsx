import { useState } from 'react';
import { Splash } from './screens/Splash/Splash';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { TopicSelection } from './screens/TopicSelection/TopicSelection';
import { SourceSelection } from './screens/SourceSelection/SourceSelection';
import { Feed } from './screens/Feed/Feed';
import { ArticleDetail } from './screens/ArticleDetail/ArticleDetail';
import { ArticleReader } from './screens/ArticleDetail/ArticleReader';
import { NonprofitsFromArticle } from './screens/NonprofitsFromArticle/NonprofitsFromArticle';
import { Welcome } from './screens/Welcome/Welcome';
import { CreateAccount } from './screens/CreateAccount/CreateAccount';
import { Account } from './screens/Account/Account';
import { Profile } from './screens/Profile/Profile';
import { Notifications } from './screens/Notifications/Notifications';
import { Contact } from './screens/Contact/Contact';
import { Receipts } from './screens/Receipts/Receipts';
import { ReceiptDetail } from './screens/Receipts/ReceiptDetail';
import { Donate } from './screens/Donate/Donate';
import { EveryOrgCheckout } from './screens/Donate/EveryOrgCheckout';
import { DonationSuccess } from './screens/Donate/DonationSuccess';
import { ONBOARDING_STEPS } from './screens/Onboarding/onboardingSteps';
import { DEFAULT_PROFILE } from './screens/Account/profile';
import { RECEIPTS } from './screens/Receipts/receiptsData';
import type { Article } from './screens/Feed/articles';
import type { Receipt } from './screens/Receipts/receiptsData';
import type { Nonprofit } from './screens/NonprofitsFromArticle/nonprofits';

type Step =
  | { name: 'splash' }
  | { name: 'onboarding'; stepIndex: number }
  | { name: 'topics' }
  | { name: 'sources'; topicIds: string[] }
  | { name: 'welcome'; topicIds: string[]; sourceIds: string[] }
  | { name: 'feed'; topicIds: string[]; sourceIds: string[] }
  | { name: 'articleDetail'; topicIds: string[]; sourceIds: string[]; article: Article }
  | { name: 'articleReader'; topicIds: string[]; sourceIds: string[]; article: Article }
  | { name: 'nonprofits'; topicIds: string[]; sourceIds: string[]; article: Article }
  | { name: 'donate'; topicIds: string[]; sourceIds: string[]; article: Article; nonprofit: Nonprofit }
  | {
      name: 'everyOrgCheckout';
      topicIds: string[];
      sourceIds: string[];
      article: Article;
      nonprofit: Nonprofit;
      amount: number;
    }
  | {
      name: 'donationSuccess';
      topicIds: string[];
      sourceIds: string[];
      nonprofit: Nonprofit;
      amount: number;
    }
  | {
      name: 'createAccount';
      topicIds: string[];
      sourceIds: string[];
      // Where Back should return to — the normal flow comes from Welcome, but Skip/Log in
      // on the onboarding carousel jump straight here, bypassing Topics/Sources/Welcome.
      backTo: { name: 'welcome' } | { name: 'onboarding'; stepIndex: number };
    }
  | { name: 'account' }
  | { name: 'profile' }
  | { name: 'notifications' }
  | { name: 'contact' }
  | { name: 'receipts' }
  | { name: 'receiptDetail'; receipt: Receipt }
  | { name: 'editTopics' }
  | { name: 'editSources' };

export function App() {
  const [step, setStep] = useState<Step>({ name: 'splash' });
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  // The topics/sources a user has actually saved to their account — distinct from the
  // in-flight topicIds/sourceIds each onboarding Step carries forward, so Settings can
  // read/edit them independent of where the user is in the onboarding flow.
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>([]);
  const [savedSourceIds, setSavedSourceIds] = useState<string[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>(RECEIPTS);

  switch (step.name) {
    case 'splash':
      return <Splash onComplete={() => setStep({ name: 'onboarding', stepIndex: 0 })} />;

    case 'onboarding':
      return (
        <Onboarding
          stepIndex={step.stepIndex}
          // Skip jumps straight to Create Account, bypassing Topics/Sources/Welcome —
          // Back from there returns to this same onboarding step, not Welcome.
          onSkip={() =>
            setStep({
              name: 'createAccount',
              topicIds: [],
              sourceIds: [],
              backTo: { name: 'onboarding', stepIndex: step.stepIndex },
            })
          }
          onNext={() => {
            const nextIndex = step.stepIndex + 1;
            if (nextIndex >= ONBOARDING_STEPS.length) {
              setStep({ name: 'topics' });
            } else {
              setStep({ name: 'onboarding', stepIndex: nextIndex });
            }
          }}
          onPrevious={() => {
            if (step.stepIndex > 0) {
              setStep({ name: 'onboarding', stepIndex: step.stepIndex - 1 });
            }
          }}
          // No separate login screen exists in this demo — "Log in here" reuses the same
          // Sign in with Apple screen as a new signup would.
          onLogin={() =>
            setStep({
              name: 'createAccount',
              topicIds: [],
              sourceIds: [],
              backTo: { name: 'onboarding', stepIndex: step.stepIndex },
            })
          }
        />
      );

    case 'topics':
      return (
        <TopicSelection
          mood="angry"
          onBack={() => setStep({ name: 'onboarding', stepIndex: ONBOARDING_STEPS.length - 1 })}
          onNext={(topicIds) => {
            setSavedTopicIds(topicIds);
            setStep({ name: 'sources', topicIds });
          }}
        />
      );

    case 'sources':
      return (
        <SourceSelection
          onBack={() => setStep({ name: 'topics' })}
          onNext={(sourceIds) => {
            setSavedSourceIds(sourceIds);
            setStep({ name: 'welcome', topicIds: step.topicIds, sourceIds });
          }}
        />
      );

    case 'welcome':
      return (
        <Welcome
          onBack={() => setStep({ name: 'sources', topicIds: step.topicIds })}
          onNext={() =>
            setStep({
              name: 'createAccount',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              backTo: { name: 'welcome' },
            })
          }
        />
      );

    case 'feed':
      return (
        <Feed
          selectedTopicIds={step.topicIds}
          onSelectArticle={(article) =>
            setStep({ name: 'articleDetail', topicIds: step.topicIds, sourceIds: step.sourceIds, article })
          }
          onOpenAccount={() => setStep({ name: 'account' })}
        />
      );

    case 'articleDetail':
      return (
        <ArticleDetail
          article={step.article}
          onBack={() => setStep({ name: 'feed', topicIds: step.topicIds, sourceIds: step.sourceIds })}
          onReadArticle={() =>
            setStep({
              name: 'articleReader',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
          onSeeNonprofits={() =>
            setStep({
              name: 'nonprofits',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
        />
      );

    case 'articleReader':
      return (
        <ArticleReader
          article={step.article}
          onBack={() =>
            setStep({
              name: 'articleDetail',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
          onSeeNonprofits={() =>
            setStep({
              name: 'nonprofits',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
        />
      );

    case 'nonprofits':
      return (
        <NonprofitsFromArticle
          topicId={step.article.topicId}
          onBack={() =>
            setStep({
              name: 'articleDetail',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
          onSelectNonprofit={(nonprofit) =>
            setStep({
              name: 'donate',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
              nonprofit,
            })
          }
          onOpenAccount={() => setStep({ name: 'account' })}
        />
      );

    case 'donate':
      return (
        <Donate
          nonprofit={step.nonprofit}
          onBack={() =>
            setStep({
              name: 'nonprofits',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
            })
          }
          onNext={(amount) =>
            setStep({
              name: 'everyOrgCheckout',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
              nonprofit: step.nonprofit,
              amount,
            })
          }
        />
      );

    case 'everyOrgCheckout':
      return (
        <EveryOrgCheckout
          nonprofit={step.nonprofit}
          amount={step.amount}
          onBack={() =>
            setStep({
              name: 'donate',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              article: step.article,
              nonprofit: step.nonprofit,
            })
          }
          onConfirm={() => {
            // Mocked — the real charge happens on Every.org's side (Donate Link / Apple
            // Pay); this just records a receipt as if their webhook had already confirmed
            // it, since there's no real backend here to actually wait on (see Donate.tsx).
            const newReceipt: Receipt = {
              id: `r-${Date.now()}`,
              nonprofitName: step.nonprofit.name,
              date: new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }),
              amount: step.amount,
              cardLabel: 'Mastercard ending in 4444',
              cardExpiry: '2/28',
            };
            setReceipts((prev) => [newReceipt, ...prev]);
            setStep({
              name: 'donationSuccess',
              topicIds: step.topicIds,
              sourceIds: step.sourceIds,
              nonprofit: step.nonprofit,
              amount: step.amount,
            });
          }}
        />
      );

    case 'donationSuccess':
      return (
        <DonationSuccess
          nonprofitName={step.nonprofit.name}
          amount={step.amount}
          onDone={() => setStep({ name: 'feed', topicIds: step.topicIds, sourceIds: step.sourceIds })}
        />
      );

    case 'createAccount':
      return (
        <CreateAccount
          onBack={() =>
            step.backTo.name === 'onboarding'
              ? setStep({ name: 'onboarding', stepIndex: step.backTo.stepIndex })
              : setStep({ name: 'welcome', topicIds: step.topicIds, sourceIds: step.sourceIds })
          }
          onNext={() => setStep({ name: 'feed', topicIds: step.topicIds, sourceIds: step.sourceIds })}
        />
      );

    case 'account':
      return (
        <Account
          profile={profile}
          topicCount={savedTopicIds.length}
          sourceCount={savedSourceIds.length}
          onBack={() => setStep({ name: 'feed', topicIds: savedTopicIds, sourceIds: savedSourceIds })}
          onOpenProfile={() => setStep({ name: 'profile' })}
          onEditTopics={() => setStep({ name: 'editTopics' })}
          onEditSources={() => setStep({ name: 'editSources' })}
          onOpenNotifications={() => setStep({ name: 'notifications' })}
          onOpenContact={() => setStep({ name: 'contact' })}
          onOpenReceipts={() => setStep({ name: 'receipts' })}
          // No real session exists in this demo — Sign Out just returns to onboarding.
          onSignOut={() => setStep({ name: 'onboarding', stepIndex: 0 })}
          // No real account exists to delete — mocked the same way as Sign Out, but
          // also clears the saved topics/sources/profile so the demo fully resets.
          onDeleteAccount={() => {
            setProfile(DEFAULT_PROFILE);
            setSavedTopicIds([]);
            setSavedSourceIds([]);
            setStep({ name: 'onboarding', stepIndex: 0 });
          }}
        />
      );

    case 'profile':
      return (
        <Profile
          profile={profile}
          onBack={() => setStep({ name: 'account' })}
          onSave={setProfile}
        />
      );

    case 'notifications':
      return <Notifications onBack={() => setStep({ name: 'account' })} />;

    case 'contact':
      return <Contact onBack={() => setStep({ name: 'account' })} />;

    case 'receipts':
      return (
        <Receipts
          receipts={receipts}
          onBack={() => setStep({ name: 'account' })}
          onSelectReceipt={(receipt) => setStep({ name: 'receiptDetail', receipt })}
        />
      );

    case 'receiptDetail':
      return (
        <ReceiptDetail
          receipt={step.receipt}
          profileEmail={profile.email}
          onBack={() => setStep({ name: 'receipts' })}
        />
      );

    case 'editTopics':
      return (
        <TopicSelection
          mood="angry"
          title="Your Topics"
          initialSelectedIds={savedTopicIds}
          nextLabel="Save"
          onBack={() => setStep({ name: 'account' })}
          onNext={(topicIds) => {
            setSavedTopicIds(topicIds);
            setStep({ name: 'account' });
          }}
        />
      );

    case 'editSources':
      return (
        <SourceSelection
          title="Your News Sources"
          initialSelectedIds={savedSourceIds}
          nextLabel="Save"
          onBack={() => setStep({ name: 'account' })}
          onNext={(sourceIds) => {
            setSavedSourceIds(sourceIds);
            setStep({ name: 'account' });
          }}
        />
      );
  }
}
