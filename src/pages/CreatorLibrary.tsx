import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from "lucide-react";
import { ContentCard } from "@/components/content/ContentCard";
import { AddContentDialog } from "@/components/content/AddContentDialog";
import { CONTENT_CATEGORIES } from "@/lib/content-categories";
import { ContentItem } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreatorContext } from "@/hooks/useCreatorContext";
import { useSearchParams } from "react-router-dom";

export default function CreatorLibrary() {
  const { selectedCreatorId } = useCreatorContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "text"
  );
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchContent = async () => {
    if (!selectedCreatorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .eq("creator_id", selectedCreatorId)
        .eq("category", selectedCategory)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
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
      toast.success("Content deleted successfully");
      fetchContent();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Please select a creator to view their library
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Library</h1>
        <p className="text-muted-foreground">
          Manage all your content assets in one place
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto">
          {CONTENT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col gap-1 py-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CONTENT_CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading content...</p>
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
                  <Button onClick={() => setAddDialogOpen(true)}>
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
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchContent}
      />
    </div>
  );
}
