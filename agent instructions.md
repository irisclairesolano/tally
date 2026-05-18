# AGENTS.md — TALLY Build Brief for SWE 1.5 (v2 · UI complete)

> **Hand this entire file to your coding agent (SWE 1.5, Devin, Cursor Agent, Claude Code, etc.) as the primary brief.**
> Every component and screen's code is inlined below. The agent does not need any other document to build the app.

---

## 1. Mission

Build a working React Native mobile application called **TALLY** — a budget tracker for Filipino students — that satisfies a laboratory project specification. Ship a runnable Expo project, a signed Android APK, and screenshots of every screen.

**No backend.** No database. No authentication. All data is hardcoded in JavaScript files inside the project.

The result must be submission-ready: the source compiles without warnings, the APK installs cleanly on a stock Android phone, and every required feature is visibly demonstrable in under 60 seconds.

---

## 2. Specification (verbatim from the instructor)

### Required features (all four must be visible)
1. **Images** — actual image assets used in the UI
2. **Bottom Tab Navigation** — persistent tab bar
3. **Stack Navigation** — push/pop transitions with back button
4. **FlatList** — high-performance scrollable list

### Required screens (minimum five)
1. **Home** — landing / dashboard
2. **List** — main FlatList demonstration
3. **Details** — stack-pushed from List
4. **Profile/About** — about the app + group members
5. **Settings/Info** — preferences + app info

### Deliverables
- Source code (runnable Expo project)
- APK file (Android, installable, ~30–60 MB)
- Screenshots (one per screen, PNG)
- Term paper — humans write this, out of scope

---

## 3. Tech Stack (locked — do not deviate)

| Layer | Choice |
|---|---|
| Framework | React Native via Expo (SDK 51+) |
| Language | **JavaScript** (no TypeScript) |
| Navigation | @react-navigation/native v6 + bottom-tabs + native-stack |
| Icons | @expo/vector-icons (Ionicons) |
| Safe area | react-native-safe-area-context |
| State | Local `useState` only |
| APK build | EAS Build (cloud) |

No TypeScript. No Redux. No Zustand. No Tailwind. No NativeWind. No other libraries.

---

## 4. UI Design System & Conventions

### Visual style
- **Aesthetic:** clean, friendly, fintech-light. Warm cream background, white card surfaces, blue primary, soft borders.
- **Density:** generous — padding 16 between cards, 12 inside cards. Never cramped.
- **Hierarchy:** uppercase muted section labels (11px) → titles (15–17px) → body (13–15px) → metadata (11–12px).

### Color usage rules
- **Backgrounds:** screens use `colors.background` (warm cream). Cards use `colors.surface` (white).
- **Primary blue:** only for the FAB-equivalent role (here: the balance card, primary buttons, active tab/filter). Never overuse.
- **Income green / Expense red:** only for the amount values themselves, not for backgrounds or borders.
- **Muted text:** `colors.textMuted` for labels and metadata. `colors.textSecondary` for body. `colors.textPrimary` for headings.

### Spacing rules
- Everything uses tokens — never raw numbers.
- Screen padding: `spacing.lg` (16).
- Vertical gap between cards: `spacing.lg` (16) using `gap` on the ScrollView's `contentContainerStyle`.
- Inner card padding: `spacing.lg` (16).

### Radius rules
- Cards and large surfaces: `radius.lg` (16).
- Buttons, inputs, smaller chips: `radius.md` (10).
- Pills, avatars: `radius.pill` (999).

### Typography rules
- App default font (system) — no custom fonts (keeps APK small).
- Headings use `fontWeight: '700'` or `'800'`. Body uses `'400'`. Labels use `'500'` or `'600'`.

### Layout patterns to reuse
- **Screen root:** `<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>`.
- **Scrollable content:** `<ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>`.
- **Section:** SectionLabel followed by Card (or Card containing SectionLabel).

### Currency formatting
Use Philippine peso. Format with `n.toLocaleString()` and prefix `₱`. Negative amounts displayed as `−₱X` (using the minus sign character `−`, not hyphen).

---

## 5. Architecture

```
tally/
├── App.js                        # Navigation root (Tab + Stack)
├── app.json
├── eas.json
├── package.json
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── images/
│       ├── hero.png
│       ├── logo.png
│       ├── empty.png
│       └── members/
│           ├── kyla.jpg
│           ├── scott.jpg
│           ├── iris.jpg
│           └── cyrene.jpg
└── src/
    ├── theme/tokens.js
    ├── data/
    │   ├── transactions.js
    │   └── members.js
    ├── components/
    │   ├── Card.js
    │   ├── SectionLabel.js
    │   ├── TransactionRow.js
    │   ├── MemberCard.js
    │   └── SettingRow.js
    └── screens/
        ├── HomeScreen.js
        ├── ListScreen.js
        ├── DetailsScreen.js
        ├── ProfileScreen.js
        └── SettingsScreen.js
```

---

## 6. Build Plan — Atomic Tasks with Full Code

Execute tasks in order. Each task has a definition of done. Do not skip ahead.

---

### TASK 01 — Initialize the project

```bash
npx create-expo-app@latest tally --template blank
cd tally
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @expo/vector-icons
```

**Acceptance:** `package.json` has all six dependencies. `npx expo start` boots without throwing.

---

### TASK 02 — Create folder structure

Create these directories: `src/theme/`, `src/data/`, `src/components/`, `src/screens/`, `assets/images/`, `assets/images/members/`.

---

### TASK 03 — Write `src/theme/tokens.js`

```javascript
export const colors = {
  primary: '#4F6DFF',
  primaryDark: '#3A52CC',
  success: '#22A06B',
  warning: '#E5A000',
  danger:  '#D63939',
  income:  '#22A06B',
  expense: '#D63939',
  background: '#F7F6F1',
  surface:    '#FFFFFF',
  surfaceAlt: '#F0EFE8',
  textPrimary:   '#0C0C0C',
  textSecondary: '#5C5C5C',
  textMuted:     '#9A9A9A',
  border: '#E8E8E3',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius  = { sm: 6, md: 10, lg: 16, pill: 999 };
```

---

### TASK 04 — Write `src/data/transactions.js`

```javascript
// 12 transactions, mixed income + expense, April 2026 dates, Filipino context.
export const transactions = [
  { id: '1',  title: 'Grocery shopping', category: 'Food',      amount: -650,  note: 'Weekly groceries at SM Supermarket', icon: 'cart-outline',          color: '#FF7A59', date: '2026-04-06T10:30:00' },
  { id: '2',  title: 'Jeepney fare',     category: 'Transport', amount: -85,   note: 'Round trip to school',                icon: 'bus-outline',           color: '#6B7FFF', date: '2026-04-06T07:45:00' },
  { id: '3',  title: 'Coffee',           category: 'Food',      amount: -120,  note: 'Iced latte at Starbucks',             icon: 'cafe-outline',          color: '#FF7A59', date: '2026-04-06T14:15:00' },
  { id: '4',  title: 'Allowance',        category: 'Income',    amount: 5000,  note: 'Weekly allowance from mom',           icon: 'cash-outline',          color: '#22A06B', date: '2026-04-05T08:00:00' },
  { id: '5',  title: 'Meralco bill',     category: 'Utilities', amount: -1850, note: 'Electricity for March',               icon: 'flash-outline',         color: '#D4A829', date: '2026-04-05T16:20:00' },
  { id: '6',  title: 'Movie ticket',     category: 'Leisure',   amount: -350,  note: 'Cinema with friends',                 icon: 'film-outline',          color: '#E36AB7', date: '2026-04-04T19:00:00' },
  { id: '7',  title: 'Lunch',            category: 'Food',      amount: -180,  note: 'Jollibee with classmates',            icon: 'fast-food-outline',     color: '#FF7A59', date: '2026-04-04T12:30:00' },
  { id: '8',  title: 'Notebook & pens',  category: 'Shopping',  amount: -240,  note: 'School supplies',                     icon: 'bag-outline',           color: '#C474FF', date: '2026-04-03T15:00:00' },
  { id: '9',  title: 'Internet bill',    category: 'Utilities', amount: -1499, note: 'PLDT monthly',                        icon: 'wifi-outline',          color: '#D4A829', date: '2026-04-03T09:00:00' },
  { id: '10', title: 'Side hustle',      category: 'Income',    amount: 2500,  note: 'Tutoring session',                    icon: 'school-outline',        color: '#22A06B', date: '2026-04-02T17:00:00' },
  { id: '11', title: 'Vitamins',         category: 'Health',    amount: -420,  note: 'Mercury Drug',                        icon: 'medical-outline',       color: '#22A06B', date: '2026-04-02T11:00:00' },
  { id: '12', title: 'Phone load',       category: 'Utilities', amount: -100,  note: 'Globe prepaid',                       icon: 'phone-portrait-outline', color: '#D4A829', date: '2026-04-01T13:00:00' },
];
```

---

### TASK 05 — Write `src/data/members.js`

```javascript
export const groupMembers = [
  { id: '1', name: 'Kyla Chua',             role: 'UI / UX Designer',     photo: require('../../assets/images/members/kyla.jpg'),   quote: 'Designed the wireframes and visual language of TALLY.' },
  { id: '2', name: 'Scott Denver Habla',    role: 'Lead Developer',       photo: require('../../assets/images/members/scott.jpg'),  quote: 'Built the navigation system and screen architecture.' },
  { id: '3', name: 'Iris Claire Solano',    role: 'Frontend Developer',   photo: require('../../assets/images/members/iris.jpg'),   quote: 'Implemented the FlatList and details screen.' },
  { id: '4', name: 'Cyrene Jane Teodocio',  role: 'Documentation Lead',   photo: require('../../assets/images/members/cyrene.jpg'), quote: 'Authored the term paper and managed deliverables.' },
];
```

---

### TASK 06 — Write `App.js`

```javascript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen     from './src/screens/HomeScreen';
import ListScreen     from './src/screens/ListScreen';
import DetailsScreen  from './src/screens/DetailsScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme/tokens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ListStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: '600' },
    }}>
      <Stack.Screen name="ListMain" component={ListScreen}    options={{ title: 'Transactions' }} />
      <Stack.Screen name="Details"  component={DetailsScreen} options={{ title: 'Transaction details' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
```

---

### TASK 07 — Write `src/components/Card.js`

```javascript
import { View } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';

export default function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    }, style]}>
      {children}
    </View>
  );
}
```

---

### TASK 08 — Write `src/components/SectionLabel.js`

```javascript
import { Text } from 'react-native';
import { colors } from '../theme/tokens';

export default function SectionLabel({ children }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.4,
      color: colors.textMuted,
      textTransform: 'uppercase',
      marginBottom: 12,
    }}>{children}</Text>
  );
}
```

---

### TASK 09 — Write `src/components/TransactionRow.js`

```javascript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/tokens';

export default function TransactionRow({ title, category, amount, icon, color }) {
  const isIncome = amount >= 0;
  const tint = isIncome ? colors.income : colors.expense;
  const bgTint = (color ?? colors.primary) + '22'; // ~13% opacity hex suffix

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    }}>
      <View style={{
        width: 36, height: 36,
        borderRadius: radius.pill,
        backgroundColor: bgTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={18} color={color ?? colors.textSecondary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '500', color: colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{category}</Text>
      </View>

      <Text style={{ fontSize: 15, fontWeight: '600', color: tint }}>
        {isIncome ? '+' : '−'}₱{Math.abs(amount).toLocaleString()}
      </Text>
    </View>
  );
}
```

---

### TASK 10 — Write `src/components/MemberCard.js`

```javascript
import { View, Text, Image } from 'react-native';
import { colors, spacing, radius } from '../theme/tokens';

export default function MemberCard({ name, role, photo, quote }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    }}>
      <Image
        source={photo}
        style={{
          width: 60, height: 60,
          borderRadius: 30,
          backgroundColor: colors.surfaceAlt,
        }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{name}</Text>
        <Text style={{ fontSize: 12, color: colors.primary, marginTop: 2 }}>{role}</Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 18 }}>{quote}</Text>
      </View>
    </View>
  );
}
```

---

### TASK 11 — Write `src/components/SettingRow.js`

```javascript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme/tokens';

export default function SettingRow({ icon, label, value, right }) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      <Ionicons name={icon} size={20} color={colors.textPrimary} />
      <Text style={{ flex: 1, fontSize: 15, color: colors.textPrimary }}>{label}</Text>
      {value ? <Text style={{ fontSize: 14, color: colors.textMuted }}>{value}</Text> : null}
      {right}
    </View>
  );
}
```

---

### TASK 12 — Write `src/screens/HomeScreen.js`

```javascript
import { ScrollView, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card           from '../components/Card';
import SectionLabel   from '../components/SectionLabel';
import TransactionRow from '../components/TransactionRow';
import { colors, spacing, radius } from '../theme/tokens';
import { transactions } from '../data/transactions';

export default function HomeScreen() {
  const income   = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance  = income - expenses;
  const peso = (n) => '₱' + n.toLocaleString();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        {/* Hero image — REQUIRED FEATURE: Images */}
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

        {/* Blue balance card */}
        <View style={{
          backgroundColor: colors.primary,
          borderRadius: radius.lg,
          padding: spacing.xl,
        }}>
          <Text style={{ color: '#C5CFFF', fontSize: 12, letterSpacing: 1.2 }}>
            TOTAL BALANCE
          </Text>
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
          {recent.map(t => <TransactionRow key={t.id} {...t} />)}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}
```

---

### TASK 13 — Write `src/screens/ListScreen.js`

```javascript
import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TransactionRow from '../components/TransactionRow';
import { colors, spacing, radius } from '../theme/tokens';
import { transactions } from '../data/transactions';

export default function ListScreen({ navigation }) {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter === 'All')     return sorted;
    if (filter === 'Income')  return sorted.filter(t => t.amount > 0);
    if (filter === 'Expense') return sorted.filter(t => t.amount < 0);
    return sorted;
  }, [filter]);

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
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.pill,
              backgroundColor: filter === opt ? colors.primary : 'transparent',
              alignItems: 'center',
            }}>
            <Text style={{
              color: filter === opt ? '#fff' : colors.textSecondary,
              fontWeight: '600',
              fontSize: 13,
            }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 13, color: colors.textMuted }}>
        Showing {filtered.length} of {transactions.length} transactions
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Details', { transaction: item })}
      activeOpacity={0.7}>
      <TransactionRow {...item} />
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 2 }} />
  );

  const renderEmpty = () => (
    <View style={{ alignItems: 'center', padding: spacing.xxl }}>
      <Image
        source={require('../../assets/images/empty.png')}
        style={{ width: 120, height: 120, marginBottom: spacing.md }}
        resizeMode="contain" />
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>Nothing here</Text>
      <Text style={{ color: colors.textMuted, marginTop: 4 }}>Try a different filter.</Text>
    </View>
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
        contentContainerStyle={{ padding: spacing.lg }}
        showsVerticalScrollIndicator={false} />
    </SafeAreaView>
  );
}
```

---

### TASK 14 — Write `src/screens/DetailsScreen.js`

```javascript
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Card         from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { colors, spacing, radius } from '../theme/tokens';

export default function DetailsScreen({ route, navigation }) {
  const { transaction } = route.params;
  const isIncome = transaction.amount >= 0;
  const tint = isIncome ? colors.income : colors.expense;
  const iconBg = (transaction.color ?? colors.primary) + '22';

  const dateString = new Date(transaction.date).toLocaleString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        {/* Hero block */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <View style={{
            width: 80, height: 80,
            borderRadius: 40,
            backgroundColor: iconBg,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: spacing.md,
          }}>
            <Ionicons name={transaction.icon} size={40} color={transaction.color ?? colors.primary} />
          </View>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>{transaction.category}</Text>
          <Text style={{ fontSize: 36, fontWeight: '700', color: tint, marginTop: 4 }}>
            {isIncome ? '+' : '−'}₱{Math.abs(transaction.amount).toLocaleString()}
          </Text>
        </View>

        {/* Details */}
        <Card>
          <SectionLabel>Details</SectionLabel>
          <DetailRow label="Title"    value={transaction.title} />
          <DetailRow label="Category" value={transaction.category} />
          <DetailRow label="Type"     value={isIncome ? 'Income' : 'Expense'} />
          <DetailRow label="Date"     value={dateString} />
        </Card>

        {/* Note */}
        {transaction.note ? (
          <Card>
            <SectionLabel>Note</SectionLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: colors.textPrimary }}>
              {transaction.note}
            </Text>
          </Card>
        ) : null}

        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: spacing.md + 2,
            borderRadius: radius.md,
            alignItems: 'center',
            marginTop: spacing.md,
          }}>
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Back to list</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ fontWeight: '500', fontSize: 14, flex: 1, textAlign: 'right', color: colors.textPrimary }}>
        {value}
      </Text>
    </View>
  );
}
```

---

### TASK 15 — Write `src/screens/ProfileScreen.js`

```javascript
import { ScrollView, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card         from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import MemberCard   from '../components/MemberCard';
import { colors, spacing, radius } from '../theme/tokens';
import { groupMembers } from '../data/members';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        {/* App identity */}
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 80, height: 80, borderRadius: radius.lg }}
            resizeMode="contain" />
          <Text style={{ fontSize: 28, fontWeight: '800', marginTop: spacing.md, color: colors.textPrimary }}>
            About TALLY
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: 6,
            maxWidth: 280,
          }}>
            A budget tracker designed for Filipino students, built as a React Native laboratory project.
          </Text>
        </View>

        {/* Project description */}
        <Card>
          <SectionLabel>Project</SectionLabel>
          <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textPrimary }}>
            TALLY helps users track daily income and expenses in Philippine pesos.
            The app demonstrates React Native, bottom tab navigation, stack
            navigation, FlatList rendering, and image handling — submitted as
            our group requirement for Mobile Application Development.
          </Text>
        </Card>

        {/* Group members */}
        <View>
          <SectionLabel>Group members</SectionLabel>
          {groupMembers.map(m => <MemberCard key={m.id} {...m} />)}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
```

---

### TASK 16 — Write `src/screens/SettingsScreen.js`

```javascript
import { useState } from 'react';
import { ScrollView, View, Text, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card         from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import SettingRow   from '../components/SettingRow';
import { colors, spacing, radius } from '../theme/tokens';

export default function SettingsScreen() {
  const [darkMode, setDarkMode]   = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>

        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>Settings</Text>

        <View>
          <SectionLabel>Preferences</SectionLabel>
          <Card style={{ padding: 0, paddingHorizontal: spacing.md }}>
            <SettingRow icon="cash-outline"     label="Currency"        value="PHP" />
            <SettingRow icon="calendar-outline" label="Start of month"  value="1" />
            <SettingRow
              icon="notifications-outline"
              label="Reminders"
              right={<Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.primary }} />} />
            <SettingRow
              icon="moon-outline"
              label="Dark mode"
              right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} />} />
          </Card>
        </View>

        <View>
          <SectionLabel>App info</SectionLabel>
          <Card>
            <View style={{ alignItems: 'center', gap: spacing.sm }}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 48, height: 48, borderRadius: radius.md }} />
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.textPrimary }}>TALLY</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Version 1.0.0 · Build 1</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm }}>
                Made with React Native and Expo.{'\n'}
                Mobile Application Development · April 2026
              </Text>
            </View>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
```

---

### TASK 17 — Source or generate image assets

Required files in `assets/images/`:
- `hero.png` — illustration for Home screen, ~800×400px
- `logo.png` — TALLY mark, ~400×400px
- `empty.png` — empty state illustration, ~400×400px
- `members/kyla.jpg`, `scott.jpg`, `iris.jpg`, `cyrene.jpg` — square portraits, 400×400px

Required files in `assets/` (Expo launcher / splash):
- `icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `adaptive-icon.png` — 1024×1024

**If the agent has image generation tools:** generate them in the TALLY palette (#4F6DFF primary, #F7F6F1 cream background).

**Fallback:** download placeholders from <https://ui-avatars.com/api/?name=Kyla+Chua&size=400&background=4F6DFF&color=fff> for member photos. For hero/logo/empty, use any clean illustration source or a simple solid-color PNG with text.

**Acceptance:** All 7 image files present in `assets/images/`, all readable, each under 500 KB.

---

### TASK 18 — Write `app.json`

```json
{
  "expo": {
    "name": "TALLY",
    "slug": "tally",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F7F6F1"
    },
    "assetBundlePatterns": ["**/*"],
    "android": {
      "package": "com.tallyteam.tally",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#F7F6F1"
      }
    }
  }
}
```

---

### TASK 19 — Write `eas.json`

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

---

### TASK 20 — Smoke test

Run `npx expo start --tunnel`. On a real Android phone with Expo Go installed, scan the QR. Verify:

1. ✅ Home tab — hero image renders, balance numbers reflect mock data (Income ₱7,500 / Expenses ₱5,694 / Balance ₱1,806)
2. ✅ List tab — FlatList scrolls, filter tabs switch, tap any row pushes to Details with slide animation
3. ✅ Details screen — shows correct transaction; "Back to list" button returns
4. ✅ About tab — logo + 4 member cards with photos
5. ✅ Settings tab — switches toggle, logo visible in info card

No red error overlays anywhere.

---

### TASK 21 — Build the APK

```bash
npm install -g eas-cli
eas login                # uses Expo credentials
eas build:configure      # accept defaults
eas build -p android --profile preview
```

Wait 10–25 minutes. Download the APK from the URL the CLI prints. Install on a real Android 7.0+ device and re-verify the smoke test from TASK 20 on the installed APK (not the dev mode).

---

### TASK 22 — Capture 5 screenshots

Save as PNG in a top-level `screenshots/` folder:
- `01-home.png`
- `02-list.png`
- `03-details.png`
- `04-about.png`
- `05-settings.png`

Use real phone resolution (1080×2340 or similar). The web preview at portrait dimensions is acceptable if a phone is unavailable.

---

## 7. Common Pitfalls — Do NOT Do These

| ❌ Mistake | ✅ Correct |
|---|---|
| `` require(`./img/${name}.jpg`) `` (template literal) | `require('./img/kyla.jpg')` — literal string, or store requires in an object |
| Padding in `style` on FlatList | Padding goes in `contentContainerStyle` |
| Forgetting `keyExtractor` on FlatList | Always `keyExtractor={item => item.id}` |
| `<View>` as screen root | Wrap in `<SafeAreaView>` from `react-native-safe-area-context` |
| Hex codes hardcoded in component files | Import from `tokens.js` |
| Tab.Navigator without `headerShown: false` | Tabs hide header; inner Stack shows its own |
| Building AAB (default) | Set `buildType: 'apk'` in eas.json |
| Using `-` (hyphen) for negative amounts | Use `−` (U+2212 minus sign) — looks cleaner |

---

## 8. Definition of Done

- [ ] `npx expo start` runs without errors
- [ ] All 5 screens render without red error overlays
- [ ] Bottom tab bar visible on every tab
- [ ] Tapping a row in List pushes to Details with slide animation
- [ ] Back button on Details returns to List
- [ ] `<Image>` rendering a real asset on Home, List (empty state), About, and Settings
- [ ] FlatList uses `data` + `keyExtractor` + `renderItem` + at least 3 of `ItemSeparatorComponent` / `ListHeaderComponent` / `ListEmptyComponent` / `contentContainerStyle`
- [ ] APK built via EAS, ~30–60 MB, installs cleanly
- [ ] 5 screenshots captured
- [ ] `npx expo-doctor` returns green

---

## 9. Reporting Format

When done, report:

```
BUILD COMPLETE
==============
Source code:  ./tally/ (git, latest commit: <sha>)
APK file:     <local path or download URL>
Screenshots:  ./screenshots/ (5 files)

Spec compliance:
  [✓] Images          — Home hero, List empty, Member cards, Settings logo
  [✓] Tab Navigation  — 4 tabs in App.js
  [✓] Stack Nav       — ListStack with 2 screens
  [✓] FlatList        — ListScreen with 6 props
  [✓] Home / List / Details / About / Settings — all 5 screens render

Smoke test: 5/5 checkpoints pass on installed APK
Test device: <device model + Android version>

Next for humans:
  - Replace placeholder member photos with real headshots
  - Write the term paper (11 sections)
  - Submit APK + source zip + paper + screenshots
```

---

## 10. Out of Scope

Do NOT implement: authentication, backend, database, Add Transaction modal, Budget Goals screen, real-time sync, offline cache (data is already local), push notifications, iOS build, the term paper.

If you find yourself implementing any of these, you have scope-crept. Stop and return to the task list.

---

**End of brief. Begin TASK 01.**
