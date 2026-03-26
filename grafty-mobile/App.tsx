import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

/**
 *  GRAFTY MASTER MOBILE CODE - GOOGLE AUTH EDITION
 *  Synced for React 19.1.0 & SDK 54
 */

WebBrowser.maybeCompleteAuthSession();

type ViewState = 'login' | 'chat_list' | 'chat_detail';

const INITIAL_CHATS = [
    { id: '1', name: 'Stalin Kumar', lastMsg: 'I have a query about the WhatsApp API.', time: '1:15 PM', unread: 2, status: 'online' },
    { id: '2', name: 'Sneha Rao', lastMsg: 'Payment completed for my campaign.', time: '11:45 AM', unread: 0, status: 'offline' },
    { id: '3', name: 'Aditya Varma', lastMsg: 'Can we schedule a call tomorrow?', time: 'Yesterday', unread: 0, status: 'online' },
    { id: '4', name: 'Priya Sharma', lastMsg: 'The flow is still showing 404 error.', time: 'Yesterday', unread: 5, status: 'online' },
    { id: '5', name: 'Rajesh Gupta', lastMsg: 'Need more credits for broadcast.', time: '2 days ago', unread: 0, status: 'offline' },
];

const MESSAGES = [
    { id: '1', text: 'Hi, I need help with the flow builder.', sender: 'customer', time: '1:15 PM' },
    { id: '2', text: 'Sure! What seems to be the issue?', sender: 'me', time: '1:16 PM' },
    { id: '3', text: 'The "Inject Code" button is not responding.', sender: 'customer', time: '1:17 PM' },
    { id: '4', text: 'Understood. Let me check your setup.', sender: 'me', time: '1:18 PM' },
];

export default function App() {
    const [view, setView] = useState<ViewState>('login');
    const [activeChat, setActiveChat] = useState<any>(null);
    const [msgInput, setMsgInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: '363172627856-1tjse3r9jbgnu71m4fgiolefbjp8cvv9.apps.googleusercontent.com',
        iosClientId: '363172627856-scs0iqk43u5eobco11cpr9jl8r1vsevi.apps.googleusercontent.com',
        androidClientId: '363172627856-1tjse3r9jbgnu71m4fgiolefbjp8cvv9.apps.googleusercontent.com',
        webClientId: '363172627856-1tjse3r9jbgnu71m4fgiolefbjp8cvv9.apps.googleusercontent.com',
        redirectUri: 'https://auth.expo.io/@stalinkumar/grafty-mobile',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            setLoading(true);
            // In a real app, you would fetch user info using the token
            // For now, we simulate success
            setTimeout(() => {
                setUser({ name: 'Grafty Admin', email: 'admin@grafty.pro' });
                setView('chat_list');
                setLoading(false);
            }, 1000);
        }
    }, [response]);

    const handleGoogleLogin = () => {
        promptAsync();
    };

    // --- (1) LOGIN VIEW ---
    if (view === 'login') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <View style={styles.loginContent}>
                    <View style={styles.loginHeader}>
                        <View style={styles.logoIcon}>
                            <Text style={{ fontSize: 48 }}>🧩</Text>
                        </View>
                        <Text style={styles.loginTitle}>Grafty</Text>
                        <Text style={styles.loginSubtitle}>Real-time CRM Engagement</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TouchableOpacity 
                            style={[styles.googleBtn, loading && styles.loginBtnDisabled]} 
                            onPress={handleGoogleLogin} 
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#000" /> : (
                                <>
                                    <Text style={{ fontSize: 22, marginRight: 12 }}>G</Text>
                                    <Text style={styles.googleBtnText}>Sign in with Google</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.orText}>OR</Text>

                        <TouchableOpacity style={styles.guestBtn} onPress={() => setView('chat_list')}>
                            <Text style={styles.guestBtnText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // --- (2) CHAT DETAIL VIEW ---
    if (view === 'chat_detail' && activeChat) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="light" />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.chatHeader}>
                        <TouchableOpacity onPress={() => setView('chat_list')} style={styles.backBtn}>
                            <Text style={{color: '#FFF', fontSize: 24}}>←</Text>
                        </TouchableOpacity>
                        <View style={styles.chatHeaderInfo}>
                            <Text style={styles.chatHeaderName}>{activeChat.name}</Text>
                            <Text style={styles.chatHeaderStatus}>{activeChat.status === 'online' ? 'Online' : 'Last seen ' + activeChat.time}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={{color: '#FFF', fontSize: 24}}>⋮</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.messagesContainer}>
                        {MESSAGES.map((msg) => (
                            <View key={msg.id} style={[styles.msgBubble, msg.sender === 'me' ? styles.msgMe : styles.msgCustomer]}>
                                <Text style={styles.msgText}>{msg.text}</Text>
                                <Text style={styles.msgTime}>{msg.time}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.inputArea}>
                        <View style={styles.inputWrapper}>
                            <TextInput 
                                style={styles.textInput}
                                placeholder="Type a message..."
                                placeholderTextColor="#64748B"
                                value={msgInput}
                                onChangeText={setMsgInput}
                            />
                            <TouchableOpacity style={styles.sendBtn}>
                                <Text style={{color: '#FFF', fontSize: 18}}>↗</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // --- (3) CHAT LIST VIEW ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.mainHeader}>
                <View>
                    <Text style={styles.mainHeaderTitle}>Conversations</Text>
                    <Text style={styles.mainHeaderSub}>{INITIAL_CHATS.length} active chats</Text>
                </View>
                <TouchableOpacity style={styles.newBtn} onPress={() => setView('login')}>
                    <Text style={{color: '#FFF', fontSize: 14, fontWeight: 'bold'}}>Log Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Text style={{fontSize: 16}}>🔍</Text>
                    <TextInput placeholder="Search..." placeholderTextColor="#64748B" style={styles.searchInput} />
                </View>
            </View>

            <FlatList 
                data={INITIAL_CHATS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.chatItem} onPress={() => { setActiveChat(item); setView('chat_detail'); }}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                            {item.status === 'online' && <View style={styles.onlineBadge} />}
                        </View>
                        <View style={styles.chatInfo}>
                            <View style={styles.chatTop}>
                                <Text style={styles.chatName}>{item.name}</Text>
                                <Text style={styles.chatTime}>{item.time}</Text>
                            </View>
                            <View style={styles.chatBottom}>
                                <Text style={styles.chatMsg} numberOfLines={1}>{item.lastMsg}</Text>
                                {item.unread > 0 && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadCount}>{item.unread}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    // Login
    loginContent: { flex: 1, paddingHorizontal: 40, justifyContent: 'center', alignItems: 'center' },
    loginHeader: { alignItems: 'center', marginBottom: 60 },
    logoIcon: { width: 100, height: 100, borderRadius: 30, backgroundColor: '#27954D15', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#27954D40' },
    loginTitle: { color: '#FFF', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
    loginSubtitle: { color: '#94A3B8', fontSize: 18, marginTop: 8, opacity: 0.8 },
    formContainer: { width: '100%' },
    googleBtn: { backgroundColor: '#FFFFFF', height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    googleBtnText: { color: '#000', fontSize: 18, fontWeight: '700' },
    orText: { color: '#475569', fontSize: 14, fontWeight: '600', textAlign: 'center', marginVertical: 24 },
    guestBtn: { backgroundColor: '#1E293B', height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFFFFF10' },
    guestBtnText: { color: '#94A3B8', fontSize: 17, fontWeight: '600' },
    loginBtnDisabled: { opacity: 0.6 },
    // List
    mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 40 },
    mainHeaderTitle: { color: '#FFF', fontSize: 28, fontWeight: '900' },
    mainHeaderSub: { color: '#64748B', fontSize: 14, marginTop: 4 },
    newBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#EF444420', borderWidth: 1, borderColor: '#EF444440' },
    searchContainer: { paddingHorizontal: 24, marginBottom: 24 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18, gap: 12 },
    searchInput: { color: '#FFF', flex: 1, fontSize: 16 },
    listContent: { paddingHorizontal: 24, paddingBottom: 40 },
    chatItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#1E293B40', padding: 18, borderRadius: 28, borderWidth: 1, borderColor: '#FFFFFF05' },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#27954D20', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#27954D', fontSize: 22, fontWeight: '900' },
    onlineBadge: { position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, backgroundColor: '#22C55E', borderRadius: 7, borderWidth: 3, borderColor: '#020617' },
    chatInfo: { flex: 1, marginLeft: 16 },
    chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chatName: { color: '#FAFAFA', fontSize: 17, fontWeight: '700' },
    chatTime: { color: '#64748B', fontSize: 12, fontWeight: '500' },
    chatBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    chatMsg: { color: '#94A3B8', fontSize: 14, flex: 1 },
    unreadBadge: { backgroundColor: '#27954D', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, minWidth: 26, alignItems: 'center' },
    unreadCount: { color: '#FFF', fontSize: 11, fontWeight: '900' },
    // Chat Detail
    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#FFFFFF08', paddingTop: 40 },
    backBtn: { padding: 8 },
    chatHeaderInfo: { flex: 1, marginLeft: 12 },
    chatHeaderName: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    chatHeaderStatus: { color: '#22C55E', fontSize: 13, fontWeight: '600' },
    actionBtn: { padding: 8 },
    messagesContainer: { padding: 24 },
    msgBubble: { maxWidth: '85%', padding: 16, borderRadius: 24, marginBottom: 16 },
    msgMe: { backgroundColor: '#27954D', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    msgCustomer: { backgroundColor: '#1E293B', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    msgText: { color: '#FFF', fontSize: 16, lineHeight: 24 },
    msgTime: { color: '#FFFFFF50', fontSize: 11, marginTop: 6, alignSelf: 'flex-end' },
    inputArea: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 20, backgroundColor: '#020617' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
    textInput: { flex: 1, color: '#FFF', fontSize: 16 },
    sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#27954D', justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});
