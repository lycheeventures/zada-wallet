import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '../../theme/Colors';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

type Credential = {
  credentialId: string;
  values: any;
  policyName: string;
};

type Props = {
  data: Credential[];
  onAccept?: (credential: Credential) => void;
  onReject?: () => void;
  onClose?: () => void;
  imageUrl?: string;
};

const CredentialListScreen = ({ data, onAccept, onReject, onClose, imageUrl }: Props) => {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const handleAccept = () => {
    const selected = data.find(d => d.credentialId === selectedId);
    if (!selected) {
      alert(t('VerificationRequestScreen.alert_message'));
      return;
    }
    onAccept?.(selected);
  };

  const renderItem = ({ item }: { item: Credential }) => {
    const isSelected = item.credentialId === selectedId;
    const isExpanded = item.credentialId === expandedId;

    const verificationName =
      item.values?.Type && item.values.Type.length !== 0
        ? item.values.Type
        : item.values &&
          item.values['Vaccine Name'] &&
          item.values['Vaccine Name'].length !== 0 &&
          item.values['Dose'] &&
          item.values['Dose'].length !== 0
        ? 'COVIDpass (Vaccination)'
        : 'Digital Certificate';

    return (
      <TouchableOpacity onPress={() => handleSelect(item.credentialId)}>
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          <View style={styles.row}>
            <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]} />
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{verificationName}</Text>

              <View style={styles.subtitleRow}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => toggleExpand(item.credentialId)}>
                  <Text style={styles.cardSubtitle}>
                    {t('VerificationRequestScreen.open_detail')}
                  </Text>
                  <Icon
                    name={isExpanded ? 'chevron-up' : 'chevron-right'}
                    size={24}
                    color={AppColors.BLUE}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>

              {isExpanded && (
                <View style={{ marginTop: 10 }}>
                  {Object.keys(item.values || {}).map(key => (
                    <View key={key} style={styles.valueRow}>
                      <Text style={styles.valueKey}>{key}</Text>
                      <Text style={styles.valueValue}>{item.values[key]}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Icon name="x" size={24} color={AppColors.BLACK} />
          </TouchableOpacity>
          <Text style={styles.toolbarTitle}>{t('VerificationRequestScreen.toolbar')}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.connectionLogoContainer}>
            <Image
              source={imageUrl ? { uri: imageUrl } : require('../../assets/images/zada_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>{t('VerificationRequestScreen.title')}</Text>
          <Text style={styles.label}>{t('VerificationRequestScreen.label')}</Text>

          <FlatList
            data={data}
            keyExtractor={item => item.credentialId}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListFooterComponent={
              <Text style={styles.footerText}>{t('VerificationRequestScreen.footer')}</Text>
            }
          />
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Text style={styles.buttonText}>{t('VerificationRequestScreen.reject')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.acceptButton]} onPress={handleAccept}>
            <Text style={styles.buttonText}>{t('VerificationRequestScreen.accept')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: AppColors.BACKGROUND },
  toolbar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: AppColors.WHITE,
    position: 'relative',
  },
  toolbarTitle: { fontSize: 18, fontWeight: 'bold', color: AppColors.BLACK },
  closeIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  body: { flex: 1, padding: 16, width: '100%' },
  connectionLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.LIGHT_GRAY,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: { width: 118, height: 118, borderRadius: 60 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'center',
    color: AppColors.BLACK,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: AppColors.BLACK,
    opacity: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  selectedCard: {
    borderColor: AppColors.BLUE,
    backgroundColor: AppColors.SELECTED_BACKGROUND_COLOR,
    borderWidth: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, color: AppColors.BLUE, fontWeight: '600' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 10,
    borderColor: '#ccc',
    marginRight: 12,
  },
  radioButtonSelected: { borderColor: AppColors.BLUE, borderWidth: 5 },
  textContainer: { flex: 1 },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    marginBottom: 4,
    paddingBottom: 2,
  },
  valueKey: { color: AppColors.BLACK, fontWeight: 'bold', width: '45%' },
  valueValue: { color: AppColors.BLACK, width: '45%' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  rejectButton: {
    flex: 1,
    marginRight: 8,
    padding: 14,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
    padding: 14,
    backgroundColor: AppColors.BRIGHT_GREEN,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: AppColors.WHITE, fontWeight: 'bold' },
  footerText: {
    fontSize: 12,
    color: AppColors.MEDIUM_GRAY,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 16,
  },
});

export default CredentialListScreen;
