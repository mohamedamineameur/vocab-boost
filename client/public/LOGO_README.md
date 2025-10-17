# Vocab Boost - Logo Assets

## 📁 Fichiers disponibles

### SVG (Vectoriel - Recommandé)
- **vocab-boost-logo.svg** - Logo vectoriel haute qualité (971 bytes)
  - Format scalable, parfait pour tous les écrans
  - Fond transparent
  - Optimisé pour le web

### PNG (Raster)
- **vocab-boost-logo.png** - Logo standard (400x120px, 9.4KB)
  - Pour les écrans desktop et tablette
  - Haute résolution (300 DPI)
  
- **vocab-boost-logo-mobile.png** - Logo mobile (200x60px, 4.4KB)
  - Optimisé pour les petits écrans
  - Poids réduit pour un chargement rapide

### Favicons
- **favicon-32x32.png** - Favicon 32x32px
- **favicon-16x16.png** - Favicon 16x16px

## 🎨 Design

### Couleurs
- **Bleu principal**: #3B82F6
- **Vert accent**: #22C55E
- **Gradient**: Du bleu au vert (135deg)

### Éléments
- **Icône**: Livre ouvert avec fusée
- **Texte**: "VocabBoost" en gras
- **Style**: Moderne, épuré, professionnel

## 📱 Usage

### Composant SVG (Recommandé)
```tsx
import VocabBoostLogo from './components/LogoComponent';

<VocabBoostLogo size={72} />
```

### Composant PNG
```tsx
import VocabBoostLogoPNG from './components/LogoComponentPNG';

<VocabBoostLogoPNG size="medium" />
// Options: "small" | "medium" | "large"
```

### Directement dans HTML
```html
<img src="/vocab-boost-logo.png" alt="Vocab Boost" />
```

## ✨ Caractéristiques

- ✅ **Mobile-first**: Responsive par défaut
- ✅ **Performance**: Tailles optimisées
- ✅ **Accessibilité**: Texte alternatif inclus
- ✅ **SEO**: Titre et description mis à jour
- ✅ **PWA-ready**: Apple touch icon configuré

## 🔄 Mise à jour

Pour régénérer les PNG depuis le SVG:
```bash
# Logo standard
convert -background transparent -density 300 vocab-boost-logo.svg -resize 400x120 vocab-boost-logo.png

# Logo mobile
convert -background transparent -density 300 vocab-boost-logo.svg -resize 200x60 vocab-boost-logo-mobile.png

# Favicons
convert -background transparent -density 300 vocab-boost-logo.svg -resize 32x32 favicon-32x32.png
convert -background transparent -density 300 vocab-boost-logo.svg -resize 16x16 favicon-16x16.png
```

## 📝 Notes

- Le composant `LogoComponent.tsx` utilise maintenant des classes Tailwind responsive
- Les tailles de texte s'adaptent automatiquement: `text-xl sm:text-2xl md:text-3xl lg:text-4xl`
- Le logo est maintenant optimisé pour tous les formats d'écran

