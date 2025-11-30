import { Badge } from "@/components/ui/badge";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { useRole } from "@/hooks/useRole";

export const AppFooter = () => {
  const { usingMockData, bbApiStatus } = useCreatorContext();
  const { isStaff } = useRole();

  if (!isStaff) return null;

  return (
    <footer className="sticky bottom-0 z-50 flex h-10 items-center justify-end gap-2 border-t border-border/50 bg-background/80 backdrop-blur-xl px-4">
      <Badge 
        variant={bbApiStatus === 'CONNECTED' ? "default" : "outline"}
        className={
          bbApiStatus === 'CONNECTED'
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700"
            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700"
        }
      >
        {bbApiStatus === 'CONNECTED' ? 'BB Connected' : 
         bbApiStatus === 'MOCK_MODE' ? 'Mock Mode' :
         bbApiStatus === 'MISSING_API_KEY' || bbApiStatus === 'MISSING_API_URL' ? 'Not Configured' :
         'Connection Error'}
      </Badge>
      
      {usingMockData && (
        <Badge 
          variant="outline"
          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700"
        >
          Using Mock Data
        </Badge>
      )}
    </footer>
  );
};
