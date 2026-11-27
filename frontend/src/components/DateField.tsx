import { useState } from 'react';
import { Keyboard, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText as Text } from './AppText';
import { Dialog } from './Dialog';
import { FormField } from './FormField';
import { HoverPressable as Pressable } from './HoverPressable';
import { Icon } from './Icon';
import { colors } from '../styles/theme';
import { formatDate } from '../utils/contracts';
import { parseDate } from '../utils/contractForm';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' });
const firstDecade = 1900;
const lastDecade = 9990;
const earliestMonth = Date.UTC(firstDecade, 0, 1);
const latestMonth = Date.UTC(9999, 11, 1);

export function DateField({ label, value, onChange, error, containerStyle }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const [decade, setDecade] = useState<number | null>(null);
  const selected = parseDate(value);
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const offset = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  function showCalendar() {
    const today = new Date();
    setDecade(null);
    setMonth(selected
      ? new Date(selected.slice(0, 7) + '-01T00:00:00Z')
      : new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1)));
    Keyboard.dismiss();
    setOpen(true);
  }

  function navigate(direction: number) {
    if (decade === null) {
      setMonth(new Date(Date.UTC(year, monthIndex + direction, 1)));
    } else {
      setDecade(decade + direction * 10);
    }
  }

  function selectYear(target: number) {
    setMonth(new Date(Date.UTC(target, monthIndex, 1)));
    setDecade(null);
  }

  return <View style={containerStyle}>
    <FormField label={label} value={value} onChangeText={onChange} error={error}
      placeholder="DD/MM/AAAA" maxLength={10} trailingIcon="calendar"
      keyboardType="numbers-and-punctuation" iconLabel={`Abrir calendário: ${label}`}
      onIconPress={showCalendar} />
    <Dialog visible={open} title={label} onClose={() => setOpen(false)}>
      <View style={s.calendar}>
        <View style={s.navigation}>
          <Pressable accessibilityRole="button" accessibilityLabel={decade === null ? 'Mês anterior' : 'Década anterior'}
            onPress={() => navigate(-1)} disabled={decade === null ? month.getTime() <= earliestMonth : decade <= firstDecade}
            style={s.navigationButton}><Icon name="arrow" /></Pressable>
          {decade === null ? <View style={s.monthHeading}>
            <Text style={s.month}>{monthLabel.format(month)} de</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Selecionar ano, ${year}`}
              accessibilityState={{ expanded: false }}
              onPress={() => setDecade(Math.floor(year / 10) * 10)}
              style={({ hovered }) => [s.yearTrigger, hovered && s.hover]}>
              <Text style={s.yearText}>{year}</Text><Icon name="chevron" size={16} />
            </Pressable>
          </View> : <Pressable accessibilityRole="button" accessibilityLabel="Voltar à seleção de dias"
            accessibilityState={{ expanded: true }} onPress={() => setDecade(null)} style={s.yearTrigger}>
            <Text style={s.yearText}>{decade}–{decade + 9}</Text><Icon name="chevron" size={16} />
          </Pressable>}
          <Pressable accessibilityRole="button" accessibilityLabel={decade === null ? 'Próximo mês' : 'Próxima década'}
            onPress={() => navigate(1)} disabled={decade === null ? month.getTime() >= latestMonth : decade >= lastDecade}
            style={[s.navigationButton, s.next]}><Icon name="arrow" /></Pressable>
        </View>
        {decade !== null ? <View style={s.grid}>
          {Array.from({ length: 10 }, (_, index) => {
            const option = decade + index;
            return <View key={option} style={s.yearCell}>
              <Pressable accessibilityRole="button" accessibilityLabel={String(option)}
                accessibilityState={{ selected: option === year }} onPress={() => selectYear(option)}
                style={({ hovered }) => [s.day, hovered && s.hover, option === year && s.selected]}>
                <Text style={option === year && s.selectedText}>{option}</Text>
              </Pressable>
            </View>;
          })}
        </View> : <View style={s.grid}>
          {weekdays.map(day => <View key={day} style={s.cell}><Text style={s.weekday}>{day}</Text></View>)}
          {Array.from({ length: offset }, (_, index) => <View key={`blank-${index}`} style={s.cell} />)}
          {Array.from({ length: days }, (_, index) => {
            const day = index + 1;
            const date = new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
            const formatted = formatDate(date);
            const active = date === selected;
            return <View key={date} style={s.cell}>
              <Pressable accessibilityRole="button" accessibilityLabel={formatted} accessibilityState={{ selected: active }}
                onPress={() => { onChange(formatted); setOpen(false); }}
                style={({ hovered }) => [s.day, hovered && s.hover, active && s.selected]}>
                <Text style={active && s.selectedText}>{day}</Text>
              </Pressable>
            </View>;
          })}
        </View>}
      </View>
    </Dialog>
  </View>;
}

const s = StyleSheet.create({
  calendar: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navigationButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  next: { transform: [{ rotate: '180deg' }] },
  month: { fontWeight: '700' },
  monthHeading: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flex: 1 },
  yearTrigger: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, minHeight: 44, borderRadius: 6 },
  yearText: { color: colors.blue, fontWeight: '700' },
  yearCell: { width: '33.33%', padding: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%' },
  weekday: { textAlign: 'center', color: colors.muted, fontSize: 11, marginBottom: 6 },
  day: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  hover: { backgroundColor: colors.softBlue },
  selected: { backgroundColor: colors.primary },
  selectedText: { color: colors.surface },
});
