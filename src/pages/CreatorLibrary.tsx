import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Plus, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { ContentItem } from "@/types/content";
import { CONTENT_CATEGORIES } from "@/lib/content-categories";
import { ContentCard } from "@/components/content/ContentCard";
import { AddContentDialog } from "@/components/content/AddContentDialog";
import { NoCreatorSelected } from "@/components/shared/NoCreatorSelected";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/use-toast";

export default function CreatorLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || CONTENT_CATEGORIES[0].id
  );
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedCreatorId, selectedCreator, usingMockData } = useCreatorContext();
  const { toast } = useToast();

  const fetchContent = async () => {
    if (!selectedCreatorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from("content_items")
        .select("*")
        .eq("creator_id", selectedCreatorId)
        .eq("folder", selectedCategory);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchContent();
      toast({
        title: "Refreshed",
        description: "Content has been refreshed from the database",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh content",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedCreatorId, selectedCategory]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && CONTENT_CATEGORIES.some((c) => c.id === categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };

  const handleContentUpdate = () => {
    fetchContent();
  };

  const handleContentDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("content_items").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Deleted",
        description: "Content deleted successfully",
      });
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const filteredContent = contentItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCreatorId) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Content Library" />
        <NoCreatorSelected />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Content Library"
        subtitle={`Managing content for ${selectedCreator?.name || 'selected creator'}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />
      
      {usingMockData && <MockModeWarning />}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="mb-4 flex-wrap h-auto">
          {CONTENT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id}>
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CONTENT_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <category.icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No content found matching your search"
                    : `No ${category.label.toLowerCase()} content yet`}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add {category.label}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    content={item.content}
                    type={item.category}
                    approvalStatus={item.approval_status}
                    shortDescription={item.short_description}
                    onUpdate={handleContentUpdate}
                    onDelete={() => handleContentDelete(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AddContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchContent}
      />
    </div>
  );
}
