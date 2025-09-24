#!/bin/bash

# Fix API endpoint prefix from no prefix to /api/ prefix
# This script updates all API calls to include the /api/ prefix

echo "🔧 Fixing API endpoint prefixes..."
echo "This will change all API calls from /endpoint to /api/endpoint"
echo ""

# Ask for confirmation
read -p "Are you sure you want to add /api/ prefix to all API calls? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo "📝 Updating API calls in src/lib/api.ts..."

# Update the API functions in api.ts
sed -i 's|api<LikeSummary>(`/meals/${mealId}/like`, { method: '\''POST'\'' });|api<LikeSummary>(`/api/meals/${mealId}/like`, { method: '\''POST'\'' });|g' src/lib/api.ts
sed -i 's|api<LikeSummary>(`/meals/${mealId}/like`, { method: '\''DELETE'\'' });|api<LikeSummary>(`/api/meals/${mealId}/like`, { method: '\''DELETE'\'' });|g' src/lib/api.ts
sed -i 's|api<LikeSummary>(`/meals/${mealId}/likes`)|api<LikeSummary>(`/api/meals/${mealId}/likes`)|g' src/lib/api.ts
sed -i 's|api<CommentPublic[]>(`/meals/${mealId}/comments`)|api<CommentPublic[]>(`/api/meals/${mealId}/comments`)|g' src/lib/api.ts
sed -i 's|api<CommentPublic>(`/meals/${mealId}/comments`, {|api<CommentPublic>(`/api/meals/${mealId}/comments`, {|g' src/lib/api.ts

echo "✅ Updated API functions in src/lib/api.ts"
echo ""
echo "📝 Updating API calls in Timeline.tsx..."

# Update Timeline.tsx API calls
sed -i 's|api<Meal[]>(*'/meals/mine'*)|api<Meal[]>('\''/api/meals/mine'\'')|g' src/pages/Timeline.tsx
sed -i 's|api<Meal[]>(*'/meals/buddy'*)|api<Meal[]>('\''/api/meals/buddy'\'')|g' src/pages/Timeline.tsx
sed -i 's|api<{ id:number; email:string; name?:string; buddy_id?:number; tdee?:number; daily_calorie_target?:number }>(*'/users/me'*)|api<{ id:number; email:string; name?:string; buddy_id?:number; tdee?:number; daily_calorie_target?:number }>('\''/api/users/me'\'')|g' src/pages/Timeline.tsx
sed -i 's|api(*`/meals/${mealId}`*, { method: '\''DELETE'\'' })|api('\''/api/meals/${mealId}'\'', { method: '\''DELETE'\'' })|g' src/pages/Timeline.tsx
sed -i 's|api<Meal>(*'/meals/upload'*, { method: '\''POST'\'', body: form })|api<Meal>('\''/api/meals/upload'\'', { method: '\''POST'\'', body: form })|g' src/pages/Timeline.tsx

echo "✅ Updated API calls in Timeline.tsx"
echo ""
echo "📝 Updating API calls in other files..."

# Update other files that might have API calls
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "api(" | while read file; do
    if [ "$file" != "src/lib/api.ts" ] && [ "$file" != "src/pages/Timeline.tsx" ]; then
        echo "Updating $file..."
        sed -i 's|api(*/meals/|api('\''/api/meals/|g' "$file"
        sed -i 's|api(*/users/|api('\''/api/users/|g' "$file"
        sed -i 's|api(*/pairing/|api('\''/api/pairing/|g' "$file"
    fi
done

echo "✅ Updated API calls in all files"
echo ""
echo -e "${GREEN}🎉 API prefix fix completed!${NC}"
echo ""
echo -e "${YELLOW}📋 What was changed:${NC}"
echo "• All API calls now use /api/ prefix"
echo "• Example: /meals/{id}/like → /api/meals/{id}/like"
echo "• This should match your backend routing"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "1. Run the curl tests again to verify the endpoints work"
echo "2. Test likes and comments in your app"
echo "3. If this doesn't work, check your backend routing configuration"
echo ""
echo -e "${RED}🔄 To undo this change, run:${NC}"
echo "git checkout src/lib/api.ts src/pages/Timeline.tsx"
