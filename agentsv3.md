# AGENTS.md v3 — Change Brief: Add Supabase Backend & CRUD

> **READ THIS FIRST:** This is a *change brief*, not a full rebuild.
> The TALLY app has already been built per AGENTS.md v2 (no backend, mock data).
> This document tells you what to **add**, **modify**, and **delete** to upgrade
> the app to a real PostgreSQL backend with full CRUD on transactions.

---

## 1. Why this change

The deliverable is an installable APK that the instructor will test on a real device. With mock data, the app is read-only — no add, no edit, no delete. Adding Supabase makes it a complete CRUD application the instructor can interact with during grading.

**Spec compliance is preserved.** All four required features (Images, Bottom Tabs, Stack Nav, FlatList) plus all five required screens (Home, List, Details, Profile/About, Settings/Info) remain. A sixth screen is added (Add Transaction, modal-presented). The original spec did not forbid extras.

---

## 2. Summary of changes

| # | Change | Type |
|---|---|---|
| 1 | Supabase project + SQL schema | Human setup |
| 2 | `.env` with Supabase credentials | New file |
| 3 | Three new npm packages | Install |
| 4 | `src/lib/supabase.js` | New file |
| 5 | `src/hooks/useTransactions.js` | New file |
| 6 | `src/hooks/useCategories.js` | New file |
| 7 | `src/screens/AddTransactionScreen.js` | New screen |
| 8 | `App.js` | Modified — wraps tabs in modal-capable RootStack + adds FAB navigation |
| 9 | `src/screens/HomeScreen.js` | Modified — fetches from DB via hook + adds FAB |
| 10 | `src/screens/ListScreen.js` | Modified — fetches from DB via hook + adds FAB + pull-to-refresh |
| 11 | `src/screens/DetailsScreen.js` | Modified — adds Edit + Delete buttons |
| 12 | `src/components/FAB.js` | New file |
| 13 | `src/components/EmptyState.js` | New file |
| 14 | `src/data/transactions.js` | **DELETED** — DB replaces it |
| 15 | `.gitignore` | Modified — add `.env` |

`src/data/members.js` and the four group photos stay exactly as-is — the About screen is unaffected. The Settings screen stays static (no DB needed for preferences in a school demo).

---

## 3. HUMAN PRE-WORK (do BEFORE running the agent)

The agent cannot create the Supabase project or generate the API keys. Do these three steps yourself, then hand the credentials to the agent.

**Step A — Create the Supabase project**
1. Go to https://supabase.com and sign up (GitHub is fastest).
2. Click **New project**. Name: `tally`. Region: **Southeast Asia (Singapore)**. Set a DB password and save it somewhere (you do not need it again for this project).
3. Wait ~2 minutes for provisioning.

**Step B — Run the schema SQL**
1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of `tally_supabase_schema.sql` (provided alongside this brief).
3. Click **Run**. You should see "Success. No rows returned."
4. Verify by running `select count(*) from public.transactions;` — expect 6.

**Step C — Copy your API credentials**
1. **Project Settings → API**.
2. Copy:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public key** (long JWT starting with `eyJ...`)
3. Paste both into a new `.env` file at the project root — see step 4 below.

---

## 4. AGENT TASKS

Execute in order. Each task has acceptance criteria.

---

### TASK V3-01 — Install new packages

```bash
cd tally
npx expo install @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-url-polyfill
```

**Acceptance:** `package.json` now lists all three. `npx expo start` still boots without errors.

---

### TASK V3-02 — Create the `.env` file

Create `.env` at the project root with the credentials from human pre-work step C:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...YOUR-ANON-KEY
```

Add `.env` to `.gitignore` (append a new line at the end of the existing `.gitignore`):

```
# Local environment
.env
```

**Acceptance:** `.env` exists with both keys. `.gitignore` ignores it.

---

### TASK V3-03 — Create `src/lib/supabase.js`

```javascript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars missing. Did you create .env?');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Acceptance:** File exists, exports `supabase`. No runtime errors when imported.

---

### TASK V3-04 — Create `src/hooks/useTransactions.js`

This hook encapsulates all CRUD on transactions. Every screen that touches transactions uses it.

```javascript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTransactions() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, title, amount, note, occurred_at,
        category:categories ( id, name, icon, color, type )
      `)
      .order('occurred_at', { ascending: false });

    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  }, []);

  const add = useCallback(async (payload) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    await fetchAll();
    return data;
  }, [fetchAll]);

  const update = useCallback(async (id, patch) => {
    const { error } = await supabase
      .from('transactions')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Derived totals — computed from items, never stored
  const income   = items.filter(t => Number(t.amount) > 0)
                        .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = items.filter(t => Number(t.amount) < 0)
                        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const balance  = income - expenses;

  return { items, loading, error, fetchAll, add, update, remove, income, expenses, balance };
}
```

**Acceptance:** Hook exists, exports `useTransactions`. Importing it in a screen does not throw.

---

### TASK V3-05 — Create `src/hooks/useCategories.js`

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon, color, type')
        .order('name');
      if (!cancelled) {
        if (!error) setItems(data || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { items, loading };
}
```

**Acceptance:** Hook exists, returns 10 categories when called.

---

### TASK V3-06 — Create `src/components/FAB.js`

The floating "+" button used on Home and List screens.

```javascript
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export default function FAB({ onPress, bottom = 24 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        position: 'absolute',
        bottom, right: 24,
        width: 56, height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 6,
      }}>
      <Ionicons name="add" size={28} color="#fff" />
    </TouchableOpacity>
  );
}
```

---

### TASK V3-07 — Create `src/components/EmptyState.js`

Reused on Home (when no transactions) and inside the List filter empty case.

```javascript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/tokens';

export default function EmptyState({ icon = 'receipt-outline', title, body }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xxl, gap: spacing.sm }}>
      <View style={{
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 4 }}>
        {title}
      </Text>
      {body ? (
        <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}
```

---

### TASK V3-08 — Create `src/screens/AddTransactionScreen.js`

Modal screen for Create AND Edit. If `route.params.transaction` is present, it edits; otherwise it adds.

```javascript
import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTransactions } from '../hooks/useTransactions';
import { useCategories }   from '../hooks/useCategories';
import SectionLabel        from '../components/SectionLabel';
import { colors, spacing, radius } from '../theme/tokens';

export default function AddTransactionScreen({ route, navigation }) {
  const editing = route?.params?.transaction ?? null;
  const isEdit  = !!editing;

  const { items: categories, loading: catsLoading } = useCategories();
  const { add, update } = useTransactions();

  const [form, setForm] = useState(() => {
    if (editing) {
      return {
        type: Number(editing.amount) >= 0 ? 'Income' : 'Expense',
        amount: String(Math.abs(Number(editing.amount))),
        category_id: editing.category?.id ?? null,
        note: editing.note ?? '',
      };
    }
    return { type: 'Expense', amount: '', category_id: null, note: '' };
  });
  const [busy, setBusy] = useState(false);

  const update1 = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const visibleCategories = useMemo(
    () => categories.filter(c => c.type === form.type.toLowerCase()),
    [categories, form.type]
  );

  const onSave = async () => {
    const num = Number(form.amount);
    if (!num || num <= 0) return Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
    if (!form.category_id) return Alert.alert('Pick a category', 'Tap one of the category icons.');

    const signed = form.type === 'Expense' ? -Math.abs(num) : Math.abs(num);
    const title  = categories.find(c => c.id === form.category_id)?.name ?? 'Transaction';

    setBusy(true);
    try {
      if (isEdit) {
        await update(editing.id, {
          title,
          amount: signed,
          note: form.note || null,
          category_id: form.category_id,
        });
      } else {
        await add({
          title,
          amount: signed,
          note: form.note || null,
          category_id: form.category_id,
          occurred_at: new Date().toISOString(),
        });
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.textSecondary }}>× Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.textPrimary }}>
            {isEdit ? 'Edit transaction' : 'Add transaction'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Type toggle */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.surfaceAlt,
          padding: 4, borderRadius: radius.pill,
        }}>
          {['Expense', 'Income'].map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => update1('type', opt)}
              style={{
                flex: 1, paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: form.type === opt ? colors.primary : 'transparent',
                alignItems: 'center',
              }}>
              <Text style={{
                color: form.type === opt ? '#fff' : colors.textSecondary,
                fontWeight: '600', fontSize: 13,
              }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <View>
          <SectionLabel>Amount (₱)</SectionLabel>
          <TextInput
            value={form.amount}
            onChangeText={v => update1('amount', v)}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            style={{
              fontSize: 32, fontWeight: '700',
              color: colors.textPrimary,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: spacing.sm,
            }} />
        </View>

        {/* Category grid */}
        <View>
          <SectionLabel>Category</SectionLabel>
          {catsLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {visibleCategories.map(c => {
                const active = form.category_id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => update1('category_id', c.id)}
                    style={{
                      width: '23%', aspectRatio: 1,
                      borderRadius: radius.md,
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                      alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    <Ionicons name={c.icon} size={22}
                      color={active ? '#fff' : colors.textSecondary} />
                    <Text style={{
                      fontSize: 10, fontWeight: '500',
                      color: active ? '#fff' : colors.textSecondary,
                    }}>{c.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Note */}
        <View>
          <SectionLabel>Note (optional)</SectionLabel>
          <TextInput
            value={form.note}
            onChangeText={v => update1('note', v)}
            placeholder="e.g. Lunch at Jollibee"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md, fontSize: 14,
              color: colors.textPrimary,
            }} />
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={onSave}
          disabled={busy}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: spacing.md + 2,
            borderRadius: radius.md,
            alignItems: 'center',
            opacity: busy ? 0.6 : 1,
            marginTop: spacing.md,
          }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
            {busy ? 'Saving…' : (isEdit ? 'Update transaction' : 'Save transaction')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
```

**Acceptance:** Screen exists. Visiting it shows the form. Save with valid input inserts a row and navigates back.

---

### TASK V3-09 — Replace `App.js`

The new App.js wraps the bottom tabs inside a Root Stack so AddTransaction can present modally over the entire app.

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen            from './src/screens/HomeScreen';
import ListScreen            from './src/screens/ListScreen';
import DetailsScreen         from './src/screens/DetailsScreen';
import ProfileScreen         from './src/screens/ProfileScreen';
import SettingsScreen        from './src/screens/SettingsScreen';
import AddTransactionScreen  from './src/screens/AddTransactionScreen';
import { colors } from './src/theme/tokens';

const Tab       = createBottomTabNavigator();
const ListNav   = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function ListStack() {
  return (
    <ListNav.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: '600' },
    }}>
      <ListNav.Screen name="ListMain" component={ListScreen}    options={{ title: 'Transactions' }} />
      <ListNav.Screen name="Details"  component={DetailsScreen} options={{ title: 'Transaction details' }} />
    </ListNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: { borderTopColor: colors.border, height: 64, paddingTop: 6, paddingBottom: 8 },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home-outline',
          List: 'list-outline',
          Profile: 'people-outline',
          Settings: 'settings-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home"     component={HomeScreen}    options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="List"     component={ListStack}     options={{ tabBarLabel: 'List' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen} options={{ tabBarLabel: 'About' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={MainTabs} />
        <RootStack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ presentation: 'modal' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

**Acceptance:** Existing tab navigation still works. Calling `navigation.navigate('AddTransaction')` from anywhere slides the modal up from the bottom.

---

### TASK V3-10 — Replace `src/screens/HomeScreen.js`

```javascript
import { ScrollView, View, Text, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card           from '../components/Card';
import SectionLabel   from '../components/SectionLabel';
import TransactionRow from '../components/TransactionRow';
import EmptyState     from '../components/EmptyState';
import FAB            from '../components/FAB';
import { useTransactions } from '../hooks/useTransactions';
import { colors, spacing, radius } from '../theme/tokens';

export default function HomeScreen({ navigation }) {
  const { items, loading, fetchAll, income, expenses, balance } = useTransactions();
  const peso = (n) => '₱' + n.toLocaleString();
  const recent = items.slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}>

        <Image
          source={require('../../assets/images/hero.png')}
          style={{ width: '100%', height: 160, borderRadius: radius.lg }}
          resizeMode="cover" />

        <View>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>Welcome to</Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: colors.textPrimary }}>TALLY</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
            Your simple budget tracker for the Philippine peso.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl }}>
          <Text style={{ color: '#C5CFFF', fontSize: 12, letterSpacing: 1.2 }}>TOTAL BALANCE</Text>
          <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700', marginTop: 6, marginBottom: spacing.lg }}>
            {peso(balance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xl }}>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Income</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{peso(income)}</Text>
            </View>
            <View>
              <Text style={{ color: '#C5CFFF', fontSize: 11 }}>Expenses</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{peso(expenses)}</Text>
            </View>
          </View>
        </View>

        <Card>
          <SectionLabel>Recent activity</SectionLabel>
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              body="Tap the + button to add your first one." />
          ) : (
            recent.map(t => (
              <TransactionRow
                key={t.id}
                title={t.title}
                category={t.category?.name ?? 'Uncategorized'}
                amount={Number(t.amount)}
                icon={t.category?.icon ?? 'cash-outline'}
                color={t.category?.color ?? colors.primary} />
            ))
          )}
        </Card>

      </ScrollView>

      <FAB onPress={() => navigation.navigate('AddTransaction')} />
    </SafeAreaView>
  );
}
```

**Acceptance:** Home renders. Balance numbers reflect the database (initial seed gives Income ₱7,500, Expenses ₱2,705, Balance ₱4,795). Pull-to-refresh works. FAB visible. Tapping FAB opens the Add modal.

---

### TASK V3-11 — Replace `src/screens/ListScreen.js`

```javascript
import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TransactionRow from '../components/TransactionRow';
import EmptyState     from '../components/EmptyState';
import FAB            from '../components/FAB';
import { useTransactions } from '../hooks/useTransactions';
import { colors, spacing, radius } from '../theme/tokens';

export default function ListScreen({ navigation }) {
  const { items, loading, fetchAll } = useTransactions();
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All')     return items;
    if (filter === 'Income')  return items.filter(t => Number(t.amount) > 0);
    if (filter === 'Expense') return items.filter(t => Number(t.amount) < 0);
    return items;
  }, [items, filter]);

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        padding: 4,
        borderRadius: radius.pill,
        marginBottom: spacing.md,
      }}>
        {['All', 'Income', 'Expense'].map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => setFilter(opt)}
            style={{
              flex: 1, paddingVertical: spacing.sm,
              borderRadius: radius.pill,
              backgroundColor: filter === opt ? colors.primary : 'transparent',
              alignItems: 'center',
            }}>
            <Text style={{
              color: filter === opt ? '#fff' : colors.textSecondary,
              fontWeight: '600', fontSize: 13,
            }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 13, color: colors.textMuted }}>
        Showing {filtered.length} of {items.length} transactions
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { transaction: item })}
      activeOpacity={0.7}>
      <TransactionRow
        title={item.title}
        category={item.category?.name ?? 'Uncategorized'}
        amount={Number(item.amount)}
        icon={item.category?.icon ?? 'cash-outline'}
        color={item.category?.color ?? colors.primary} />
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="receipt-outline"
      title="No transactions"
      body="Try a different filter or add a new transaction." />
  );

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />} />

      <FAB onPress={() => navigation.getParent()?.navigate('AddTransaction')} />
    </SafeAreaView>
  );
}
```

**Acceptance:** List shows DB transactions. Filter still works. Pull-to-refresh works. FAB opens the Add modal (uses `getParent()` because the FAB is inside the inner Stack and the modal is on the Root Stack).

---

### TASK V3-12 — Replace `src/screens/DetailsScreen.js`

Adds Edit and Delete buttons. Both call into the `useTransactions` hook.

```javascript
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Card         from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { useTransactions } from '../hooks/useTransactions';
import { colors, spacing, radius } from '../theme/tokens';

export default function DetailsScreen({ route, navigation }) {
  const { transaction } = route.params;
  const { remove } = useTransactions();

  const amount   = Number(transaction.amount);
  const isIncome = amount >= 0;
  const tint     = isIncome ? colors.income : colors.expense;
  const iconBg   = (transaction.category?.color ?? colors.primary) + '22';

  const dateString = new Date(transaction.occurred_at).toLocaleString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const onEdit = () => {
    navigation.getParent()?.navigate('AddTransaction', { transaction });
  };

  const onDelete = () => {
    Alert.alert(
      'Delete transaction?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await remove(transaction.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Delete failed', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: iconBg,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: spacing.md,
          }}>
            <Ionicons
              name={transaction.category?.icon ?? 'cash-outline'}
              size={40}
              color={transaction.category?.color ?? colors.primary} />
          </View>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            {transaction.category?.name ?? 'Uncategorized'}
          </Text>
          <Text style={{ fontSize: 36, fontWeight: '700', color: tint, marginTop: 4 }}>
            {isIncome ? '+' : '−'}₱{Math.abs(amount).toLocaleString()}
          </Text>
        </View>

        <Card>
          <SectionLabel>Details</SectionLabel>
          <DetailRow label="Title"    value={transaction.title} />
          <DetailRow label="Category" value={transaction.category?.name ?? 'Uncategorized'} />
          <DetailRow label="Type"     value={isIncome ? 'Income' : 'Expense'} />
          <DetailRow label="Date"     value={dateString} />
        </Card>

        {transaction.note ? (
          <Card>
            <SectionLabel>Note</SectionLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>
              {transaction.note}
            </Text>
          </Card>
        ) : null}

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          <TouchableOpacity
            onPress={onEdit}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: spacing.md + 2,
              borderRadius: radius.md,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={{
              flex: 1,
              backgroundColor: colors.danger,
              paddingVertical: spacing.md + 2,
              borderRadius: radius.md,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    }}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '500', fontSize: 14, flex: 1, textAlign: 'right', color: colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}
```

**Acceptance:** Details screen shows Edit + Delete buttons. Edit opens the Add modal pre-filled. Delete shows a confirm dialog; confirming removes the row from DB and pops back to List.

---

### TASK V3-13 — Delete `src/data/transactions.js`

The mock data file is no longer the source of truth.

```bash
rm src/data/transactions.js
```

**Important:** Make sure no remaining file imports from `src/data/transactions`. Search and confirm zero matches before deleting.

**Acceptance:** File does not exist. App still compiles (no broken imports).

---

### TASK V3-14 — Smoke test the full CRUD flow

Run the app via `npx expo start --tunnel`. On a real Android phone (or web preview):

1. ✅ **Read** — Home shows balance numbers from DB seed (₱4,795 balance). List shows 6 transactions.
2. ✅ **Create** — Tap FAB on Home or List. Modal slides up. Pick Expense, enter "150", pick Food category, type "Test note". Tap Save. Modal closes. List now shows 7 transactions; balance updated.
3. ✅ **Read after create** — New transaction appears at top of the list (most recent).
4. ✅ **Update** — Tap the new transaction → Details screen. Tap Edit. Modal opens with values pre-filled. Change amount to 200. Tap Update transaction. Modal closes. Details screen and list both show the new amount.
5. ✅ **Delete** — From Details, tap Delete. Confirm. Returns to List. The transaction is gone. Balance updated.

**If any step fails:** check the Supabase dashboard's **Logs** → **API** to see what the request looked like.

---

### TASK V3-15 — Rebuild the APK

The previous APK no longer works (it has no backend code). Build a fresh one.

```bash
eas build -p android --profile preview
```

The new APK file size will be slightly larger (~5–8 MB more) due to the Supabase client and AsyncStorage.

**Critical:** the APK reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from environment at build time. These are baked into the APK. Make sure `.env` exists at the project root before running `eas build`, or the production APK will not be able to reach the database.

**Verify the production APK:** install it on a phone, turn off Wi-Fi/data briefly → app loads with an error / empty state (proves it's hitting the network). Turn data back on → data appears. Add a transaction → it appears immediately. Restart the app → the new transaction is still there. The data lives in the cloud now.

---

## 5. Common new pitfalls (added in v3)

| ❌ Mistake | ✅ Correct |
|---|---|
| Forgetting `.env` before `eas build` | Build embeds env vars at build time — set them first |
| Forgetting to add `.env` to `.gitignore` | Anon key leaks are low-severity but still bad practice |
| Forgetting `react-native-url-polyfill/auto` import | Supabase client errors with "URL is undefined" |
| Using `navigation.navigate('AddTransaction')` from inside ListStack | The modal lives on Root Stack — use `navigation.getParent()?.navigate(...)` |
| Storing computed totals in state | Compute via `useMemo` or directly in the hook — single source of truth |
| Trying to use real auth | Out of scope. Permissive RLS + anon key only. |

---

## 6. Updated Definition of Done

In addition to v2's definition of done:

- [ ] Supabase project created and SQL schema applied
- [ ] `.env` exists with valid URL + anon key
- [ ] App fetches transactions from DB on launch
- [ ] FAB on Home and List opens Add Transaction modal
- [ ] Save in Add Transaction inserts a row in `public.transactions`
- [ ] Edit button on Details navigates to Add modal pre-filled
- [ ] Update in edit mode modifies the row, not creates a new one
- [ ] Delete from Details removes the row after confirmation
- [ ] Pull-to-refresh updates Home and List data
- [ ] Production APK works against the live Supabase database

---

## 7. Out of scope (still)

Same as v2 — plus:

- Authentication (signup, login, sessions)
- User-scoped data (every user sees the same shared transactions)
- Edit categories from inside the app (use Supabase SQL Editor)
- Real-time subscriptions across devices
- Offline write queue (the app needs network to write)

If a future spec demands per-user data: the AGENTS.md v4 brief will add Supabase auth, RLS policies tied to `auth.uid()`, and a Login/Signup flow. That is not part of this submission.

---

## 8. Reporting Format (when done)

```
V3 CRUD MIGRATION COMPLETE
==========================
Supabase project: https://<ref>.supabase.co
Schema applied:   2 tables (categories, transactions), 10 + 6 seed rows
.env present:     yes
New APK:          <download URL>, <size MB>

CRUD verification on installed APK:
  [✓] CREATE  — added "Test 150 PHP" via FAB; appears in list
  [✓] READ    — all 7 transactions visible on List screen
  [✓] UPDATE  — edited "Test" to 200 PHP; reflects in DB
  [✓] DELETE  — removed "Test"; gone from DB

Spec compliance (preserved):
  [✓] Images / Tab Nav / Stack Nav / FlatList — all still passing
  [✓] All 5 required screens render
  [+] 1 extra screen (AddTransaction modal) — counts as bonus

Term paper updates needed:
  - Section 5 (Technologies Used): add Supabase, @supabase/supabase-js, AsyncStorage
  - Section 6 (System Features): mention real-time persistence + CRUD
  - Section 4 (Scope): drop "data does not persist after the app is closed"
```

---

**End of change brief. Begin TASK V3-01.**
