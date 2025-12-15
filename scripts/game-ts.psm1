# The dev scripts for game-ts are also loaded by my code-ps1 project at:
# C:/Users/<username>/OneDrive/ps1/projects/kj-project-game-ts.psm1
# 
# To reload the user profile modules, run 'p'
# To view the imported commands, run 'shkj'
# To view sources of code-ps1 logic in VS Code, run 'code-ps1'

Set-StrictMode -Version Latest

function format {
    npmr format:fix
}

function eslint {
    npmr eslint:cached
}

function qcheck {
    npmr qcheck
}

function oxlint {
    npmr oxlint
}

function test {
    npmr test
}

function testui {
    npmr test:ui
}

function tsc {
    npmr tsc
}

function dev {
    npmr dev
}

function preview {
    npmr preview
}

function npmr {
    <#
    .SYNOPSIS
    Runs an npm script from the web directory.
    
    .DESCRIPTION
    Changes to the web directory, runs the specified npm script, and then returns to the parent directory
    
    .PARAMETER script
    The npm script to run (e.g., "test:ui", "build", etc.)
    
    .EXAMPLE
    npmr test:ui
    Runs 'npm run test:ui' from the web directory
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$script
    )
    
    if (Test-Path "package.json") {
        # Already in web directory
        npm run $script
    }
    elseif (Test-Path "web\package.json") {
        Set-Location web
        npm run $script
        Set-Location ..
    }
    else {
        Write-Error "Must be run from the game-ts repository root or web directory"
    }
}

Export-ModuleMember -Function *
