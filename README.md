# Gobble Dash — The Great Thanksgiving Escape

[![turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Dodcoin/turkey-run-game-01-repo/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Dodcoin/turkey-run-game-01-repo/reward.svg)](https://make.fun/c/turkey-run-game-01)

Thanksgiving is coming, and **you are the dinner**. Play a plump turkey
escaping Farmer Bram across the farmyard, through the barn and into the
kitchen — leaping ovens, dodging carving knives, grabbing corn and hiding in
haystacks — to reach the forest 1000 m away.

## Play

Open `game/index.html` in desktop Chrome. No build step, no network: every
sound is synthesized live with WebAudio and every sprite is drawn by the
game's own canvas code.

- **Move** ← → or A / D · **Jump** Space / W / ↑ · **Duck & hide in hay** S / ↓
- **Pause** P · **Mute** M · **Restart** Enter or the on-screen button

Hide in a haystack and the farmer searches right past you. Lose all 3 lives
and you are caught; reach 1000 m and you escape.

## Entry

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-game.ts`. It is fully offline and deterministic.

```
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
