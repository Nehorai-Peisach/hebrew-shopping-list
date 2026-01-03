# Firebase Storage CORS Setup Guide

## בעיה
אתה מקבל שגיאת CORS כשמנסה להעלות תמונות:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```

## פתרון

### שלב 1: התקן Firebase CLI
```bash
npm install -g firebase-tools
```

### שלב 2: התחבר ל-Firebase
```bash
firebase login
```

### שלב 3: הגדר CORS למחסן שלך

ב-Windows PowerShell, הפעל את הפקודה הזו:

```bash
gsutil cors set cors.json gs://grouped-list.firebasestorage.app
```

**הערה:** החלף את `grouped-list` בשם המחסן שלך (זה חלק מ-Firebase project ID שלך).

### שלב 4: אימות
כדי לאמת שה-CORS הוגדר כראוי:
```bash
gsutil cors get gs://grouped-list.firebasestorage.app
```

צריך לראות את ה-CORS configuration שהוגדר.

## פרטים טכניים

קובץ ה-`cors.json` בפרויקט שלך מכיל:
- ✅ localhost:4200 (פיתוח)
- ✅ Firebase hosting domains
- ✅ All required HTTP methods (GET, HEAD, DELETE, PUT, POST, OPTIONS)
- ✅ 1 שעה cache max age

## אם עדיין יש בעיה

1. **בדוק את Firebase Console:**
   - עבור אל Storage
   - בדוק אם ה-rules מאפשרים קריאה וכתיבה:
   ```
   match /items/{userId}/{allPaths=**} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

2. **כדי להעלות את storage.rules ל-Firebase:**
   ```bash
   firebase deploy --only storage
   ```

3. **אם עדיין יש שגיאה, בדוק:**
   - שאתה logged in כ-user בעל הרשאות
   - שה-project ID בהגדרות סביבה נכון
   - בדוק ב-Browser DevTools Console אם יש errors נוספים

## Localhost Development
אם אתה משתמש ב-localhost, וממשיך לקבל שגיאות:
1. בדוק ש-CORS היה הגדר כראוי
2. כדי להעלות כ-localhost, אתה צריך גם:
   ```bash
   gsutil cors set cors.json gs://your-bucket-name.appspot.com
   ```

