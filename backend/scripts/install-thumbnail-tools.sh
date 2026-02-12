#!/bin/bash

# Installation script for PDF thumbnail generation tools
# This script installs the necessary dependencies for local thumbnail generation

echo "🔍 Checking for PDF thumbnail generation tools..."

# Check if Homebrew is installed (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew not found. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi

    # Check for Poppler (recommended)
    if command -v pdftoppm &> /dev/null; then
        echo "✅ Poppler (pdftoppm) already installed"
    else
        echo "📦 Installing Poppler..."
        brew install poppler
    fi

    # Check for ImageMagick (alternative)
    if command -v convert &> /dev/null; then
        echo "✅ ImageMagick already installed"
    else
        echo "📦 Installing ImageMagick..."
        brew install imagemagick
    fi

    # qlmanage is built into macOS
    if command -v qlmanage &> /dev/null; then
        echo "✅ Quick Look (qlmanage) available (macOS built-in)"
    fi

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux installation
    echo "🐧 Detected Linux system"
    
    # Check for apt (Debian/Ubuntu)
    if command -v apt-get &> /dev/null; then
        echo "📦 Installing Poppler utils..."
        sudo apt-get update
        sudo apt-get install -y poppler-utils
        
        echo "📦 Installing ImageMagick..."
        sudo apt-get install -y imagemagick
    
    # Check for yum (RHEL/CentOS)
    elif command -v yum &> /dev/null; then
        echo "📦 Installing Poppler utils..."
        sudo yum install -y poppler-utils
        
        echo "📦 Installing ImageMagick..."
        sudo yum install -y ImageMagick
    
    else
        echo "❌ Unsupported package manager. Please install poppler-utils and imagemagick manually."
        exit 1
    fi

else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Available tools:"
command -v pdftoppm &> /dev/null && echo "  ✓ pdftoppm (Poppler) - Recommended"
command -v convert &> /dev/null && echo "  ✓ convert (ImageMagick)"
command -v qlmanage &> /dev/null && echo "  ✓ qlmanage (macOS Quick Look)"
echo ""
echo "🚀 You can now use local thumbnail generation!"
