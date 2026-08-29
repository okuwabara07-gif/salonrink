#!/bin/zsh
# 使い方: pool フォルダの中で実行する
#   cd <プロジェクト>/assets/photos/pool
#   zsh rename-pool.zsh
# 各カテゴリを <slug>-01.png .. -NN.png に連番リネームする。
# 日本語名・スペース・スラッシュ(:)入りの名前を安全な形に直す。

setopt NULL_GLOB

ren() {
  local sub="$1" slug="$2" i=1 f
  for f in *"$sub"*.png; do
    [[ -e "$f" ]] || continue
    [[ "$f" == ${slug}-*.png ]] && continue   # 既にリネーム済みは飛ばす
    mv -- "$f" "${slug}-$(printf '%02d' $i).png"
    print "  $f  ->  ${slug}-$(printf '%02d' $i).png"
    i=$((i+1))
  done
}

print "== renaming =="
ren '・艶'            hair-gloss
ren '退色'            hair-fade
ren 'うねり'          hair-frizz
ren '後ろ45'          finish-back
ren '横顔'            finish-profile
ren 'サロン全体'      salon
ren 'カウンセリング'  counseling
ren 'トリートメント'  treatment
ren 'バックシャンプー' backwash
ren '静かな'          interior
ren '鏡'              chair
ren 'ブロー'          blowdry
ren '製品'            product
ren 'タブレット'      tablet
ren '受付'            reception

print "\n== result (counts) =="
for slug in hair-gloss hair-fade hair-frizz finish-back finish-profile salon counseling treatment backwash interior chair blowdry product tablet reception; do
  n=( ${slug}-*.png )
  print "  $slug : ${#n}"
done

leftover=( *.png )
filtered=()
for f in $leftover; do [[ "$f" == *-[0-9][0-9].png ]] || filtered+=("$f"); done
if (( ${#filtered} )); then
  print "\n!! 未リネームのファイルが残っています（手動確認を）:"
  for f in $filtered; do print "   $f"; done
fi
