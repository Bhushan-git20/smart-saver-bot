import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CategorizationRule {
  id: string;
  keyword: string;
  category: string;
  priority: number;
  is_active: boolean;
}

const CATEGORIES = [
  'Food', 'Transportation', 'Shopping', 'Entertainment', 
  'Utilities', 'Healthcare', 'Education', 'Travel',
  'Housing', 'Income', 'Investments', 'Other'
];

export const AutoCategorizationManager: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null);
  
  const [formData, setFormData] = useState({
    keyword: '',
    category: '',
    priority: 1
  });

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('categorization_rules')
        .select('*')
        .eq('user_id', user?.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Failed to fetch categorization rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !formData.keyword || !formData.category) return;

    try {
      if (editingRule) {
        const { error } = await supabase
          .from('categorization_rules')
          .update({
            keyword: formData.keyword,
            category: formData.category,
            priority: formData.priority
          })
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('Rule updated successfully');
      } else {
        const { error } = await supabase
          .from('categorization_rules')
          .insert({
            user_id: user.id,
            keyword: formData.keyword,
            category: formData.category,
            priority: formData.priority
          });

        if (error) throw error;
        toast.success('Rule added successfully');
      }

      setFormData({ keyword: '', category: '', priority: 1 });
      setShowAddDialog(false);
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error('Failed to save rule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorization_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const toggleRuleStatus = async (rule: CategorizationRule) => {
    try {
      const { error } = await supabase
        .from('categorization_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error('Error updating rule status:', error);
      toast.error('Failed to update rule status');
    }
  };

  const startEdit = (rule: CategorizationRule) => {
    setEditingRule(rule);
    setFormData({
      keyword: rule.keyword,
      category: rule.category,
      priority: rule.priority
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({ keyword: '', category: '', priority: 1 });
    setEditingRule(null);
    setShowAddDialog(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Auto-Categorization Rules
        </CardTitle>
        <CardDescription>
          Set up keywords to automatically categorize your transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Rule' : 'Add New Rule'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyword">Keyword</Label>
                  <Input
                    id="keyword"
                    value={formData.keyword}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                    placeholder="e.g., zomato, uber, amazon"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher priority rules are checked first
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit}>
                    {editingRule ? 'Update' : 'Add'} Rule
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No categorization rules set up yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add rules to automatically categorize your transactions
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    Priority {rule.priority}
                  </Badge>
                  <div>
                    <p className="font-medium">"{rule.keyword}"</p>
                    <p className="text-sm text-muted-foreground">→ {rule.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRuleStatus(rule)}
                  >
                    {rule.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(rule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};