/**
 * Version情報を取得するためのスクリプト
 * Commit Hashと Build Dateを取得して、version.jsonに書き出す
 * @typedef {Object} VersionInfo
 * @property {string} commitSha - Git commit SHA (short)
 * @property {string} buildDate - Build date in ISO format
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const versionFilePath = path.join(__dirname, '..', 'lib', 'version.json')

try {
  // Get the current git commit SHA (short version)
  const commitSha = execSync('git rev-parse --short HEAD').toString().trim()

  // Get the current date and time
  const buildDate = new Date().toISOString()

  // Create version info object
  /** @type {VersionInfo} */
  const versionInfo = {
    commitSha,
    buildDate,
  }

  // Write to a JSON file that can be imported
  fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2))

  console.log('Version info generated:')
  console.log(`  Commit SHA: ${commitSha}`)
  console.log(`  Build Date: ${buildDate}`)
} catch (error) {
  console.error('Error generating version info:', error.message)
  // Write a fallback version
  const fallbackVersion = {
    commitSha: 'unknown',
    buildDate: new Date().toISOString(),
  }
  fs.writeFileSync(versionFilePath, JSON.stringify(fallbackVersion, null, 2))
}
