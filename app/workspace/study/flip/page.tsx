"use client";

import { Button } from "components/ui/Button";
import { Card } from "components/ui/Card";
import { getDeckById } from "services/deck.service";
import { getUser } from "services/user.service";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Deck } from "db/types/models.types";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCw,
  BookOpen,
  RefreshCw,
  Clock,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "components/ui/Alert-dialog";
import { formatTime } from "utils/date.utils";
import { useStudySession } from "hooks/useStudySession";
import { Progress } from "components/ui/Progress";
import { ErrorState, LoadingState } from "components/study";
import NoAccessState from "components/study/states/NoAccessState";

export default function FlipStudyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = searchParams.get("deckId");

  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [noPermission, setNoPermission] = useState(false);

  const userId = useRef<string | null>(null);
  const initialMastery = useRef<number>(0);

  const {
    studyTime,
    isStudying,
    isSaving,
    startStudySession,
    handleEndSession,
    getNewMastery,
  } = useStudySession({
    deck,
    userId: userId.current,
    initialMastery: initialMastery.current,
    studyMode: "flip",
  });

  const navigateCard = useCallback(
    (direction: "prev" | "next") => {
      if (!deck?.flashcards) return;

      const totalCards = deck.flashcards.length;
      let newIndex;

      if (direction === "prev") {
        newIndex =
          currentCardIndex === 0 ? totalCards - 1 : currentCardIndex - 1;
      } else {
        newIndex =
          currentCardIndex === totalCards - 1 ? 0 : currentCardIndex + 1;
      }

      setIsFlipped(false);
      setCurrentCardIndex(newIndex);
    },
    [deck, currentCardIndex]
  );

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) {
        router.push("/workspace/library");
        return;
      }

      try {
        const { data: user } = await getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        userId.current = user.id;
        const deckResponse = await getDeckById(deckId, user.id);

        if (!deckResponse.data) {
          router.push("/workspace/library");
          return;
        }

        if (deckResponse.data.visibility !== "public" && deckResponse.data.userId !== user.id) {
          setNoPermission(true);
          return;
        }

        setDeck(deckResponse.data as unknown as Deck);
        initialMastery.current = deckResponse.data.progress?.mastery || 0;
      } catch (error) {
        console.error("Error fetching deck:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, router]);

  useEffect(() => {
    if (deck && !isStudying && !isLoading) {
      startStudySession();
    }
  }, [deck, isStudying, isLoading, startStudySession]);

  if (isLoading || isSaving) {
    return <LoadingState isSaving={isSaving} />;
  }

  if (noPermission) {
    return <NoAccessState />;
  }

  if (!deck?.flashcards?.length) {
    return (
      <ErrorState
        title="No Cards Found"
        message="This deck doesn't have any flashcards yet."
        buttonText="Return to Library"
        buttonAction={() => router.push("/workspace/library")}
      />
    );
  }

  const currentCard = deck.flashcards[currentCardIndex];
  const totalCards = deck.flashcards.length;
  const progress = ((currentCardIndex + 1) / totalCards) * 100;
  const masteryGain = getNewMastery() - initialMastery.current;

  return (
    <div className="container max-w-3xl mx-auto py-6 md:py-8 px-3 md:px-4 mt-14 md:mt-16">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 h-8 md:h-10 text-primary border-primary/30 hover:bg-primary/10"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">End Session</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Study Session?</AlertDialogTitle>
                <AlertDialogDescription className="flex flex-col gap-1">
                  Your progress will be saved. You&apos;ve studied for{" "}
                  {formatTime(studyTime)}.
                  {studyTime >= 60 && initialMastery.current <= 50 && (
                    <span className="text-primary font-medium">
                      You&apos;ll gain {masteryGain}% mastery from this session.
                    </span>
                  )}
                  {(initialMastery.current > 50 ||
                    (getNewMastery() === 50 &&
                      initialMastery.current < 50)) && (
                    <span className="text-red-500">
                      You've reached the maximum 50% mastery allowed in this
                      study mode. Study in another mode to progress further.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Studying</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndSession}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSaving ? "Saving..." : "Save & End Session"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 md:gap-2 bg-secondary/30 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
            <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>
              {currentCardIndex + 1}/{totalCards}
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 bg-primary/10 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>{formatTime(studyTime)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold truncate">{deck.name}</h1>
        <p className="text-muted-foreground text-sm md:text-base line-clamp-1">
          {deck.description || "No description"}
        </p>
      </div>

      <Progress
        value={progress}
        className="w-full h-1 rounded-full overflow-hidden mb-6 md:mb-8"
      />

      <div className="w-full aspect-[4/3] md:aspect-[3/2] max-w-2xl mx-auto mb-6 md:mb-8 perspective-1000">
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? "rotate-y-180" : ""}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute inset-0 backface-hidden">
            <Card className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-secondary/30 rounded-xl cursor-pointer bg-gradient-to-br from-background to-secondary/10">
              <div className="absolute top-3 md:top-4 left-3 md:left-4 text-primary/50">
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="absolute top-3 md:top-4 right-3 md:right-4 text-xs text-muted-foreground">
                Question
              </div>
              <div className="w-full max-w-md text-center overflow-y-auto max-h-[70%] px-2 py-2 my-auto">
                <div className="text-base sm:text-lg md:text-xl font-medium break-words">
                  {currentCard.question}
                </div>
              </div>
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-muted-foreground/50 text-xs md:text-sm italic">
                Tap to flip
              </div>
            </Card>
          </div>

          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <Card className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 shadow-md hover:shadow-lg transition-shadow rounded-xl cursor-pointer">
              <div className="absolute top-3 md:top-4 left-3 md:left-4 text-primary/50">
                <RotateCw className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="absolute top-3 md:top-4 right-3 md:right-4 text-xs text-muted-foreground">
                Answer
              </div>
              <div className="w-full max-w-md text-center overflow-y-auto max-h-[70%] px-2 py-2 my-auto">
                <div className="text-base sm:text-lg md:text-xl break-words">
                  {currentCard.answer}
                </div>
              </div>
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-muted-foreground/50 text-xs md:text-sm italic">
                Tap to flip back
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center md:hidden">
        <Button
          variant="outline"
          onClick={() => navigateCard("prev")}
          className="w-10 h-10 p-0 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setIsFlipped(!isFlipped)}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-2 rounded-full"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Flip
        </Button>
        <Button
          onClick={() => navigateCard("next")}
          className="w-10 h-10 p-0 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="hidden md:flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigateCard("prev")}
          className="flex items-center gap-1 px-4 py-2 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setIsFlipped(!isFlipped)}
          variant="secondary"
          className="rounded-full"
        >
          Flip Card
        </Button>
        <Button
          onClick={() => navigateCard("next")}
          className="flex items-center gap-1 px-4 py-2 rounded-full"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
