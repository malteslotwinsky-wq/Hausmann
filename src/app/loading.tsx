import { BauLotIcon } from '@/components/ui/Logo';

export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse text-accent-foreground">
                    <BauLotIcon size={28} />
                </div>
                <p className="text-muted-foreground">Laden...</p>
            </div>
        </div>
    );
}
