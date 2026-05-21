import { useState, useMemo } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTransactions } from '../hooks/useTransactions';
import { useCategories }   from '../hooks/useCategories';
import SectionLabel        from '../components/SectionLabel';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius } from '../theme/tokens';

export default function AddTransactionScreen({ route, navigation }) {
  const { colors } = useTheme();
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
